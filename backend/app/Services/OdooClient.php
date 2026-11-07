<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OdooClient
{
    private string $url;
    private string $db;
    private string $username;
    private string $password;
    private ?string $sessionId = null;

    public function __construct()
    {
        $this->url      = rtrim(config('services.odoo.url'), '/');
        $this->db       = config('services.odoo.db');
        $this->username = config('services.odoo.username');
        $this->password = config('services.odoo.password');
    }

    private function authenticate(): void
    {
        $response = Http::withHeaders(['Content-Type' => 'application/json'])
            ->timeout(10)
            ->post($this->url . '/web/session/authenticate', [
                'jsonrpc' => '2.0',
                'method'  => 'call',
                'params'  => [
                    'db'       => $this->db,
                    'login'    => $this->username,
                    'password' => $this->password,
                ],
            ]);

        if ($response->failed()) {
            throw new \RuntimeException('Odoo auth failed: ' . $response->status());
        }

        $data = $response->json();

        if (isset($data['error']) || empty($data['result']['uid'])) {
            throw new \RuntimeException('Odoo auth failed: invalid credentials');
        }

        preg_match('/session_id=([^;]+)/', $response->header('Set-Cookie'), $matches);
        $this->sessionId = $matches[1] ?? null;

        if (!$this->sessionId) {
            throw new \RuntimeException('Odoo auth failed: no session cookie');
        }
    }

    private function call(string $model, string $method, array $args = [], array $kwargs = []): mixed
    {
        if (!$this->sessionId) {
            $this->authenticate();
        }

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
            'Cookie'       => 'session_id=' . $this->sessionId,
        ])->timeout(30)->post($this->url . '/web/dataset/call_kw', [
            'jsonrpc' => '2.0',
            'method'  => 'call',
            'params'  => [
                'model'  => $model,
                'method' => $method,
                'args'   => $args,
                'kwargs' => $kwargs,
            ],
        ]);

        $data = $response->json();

        if (isset($data['error'])) {
            Log::error('Odoo RPC error', ['error' => $data['error']]);
            throw new \RuntimeException('Odoo error: ' . $data['error']['message']);
        }

        return $data['result'];
    }

    public function searchRead(string $model, array $domain = [], array $fields = [], int $limit = 100): array
    {
        return $this->call($model, 'search_read', [$domain], ['fields' => $fields, 'limit' => $limit]);
    }

    public function create(string $model, array $values): int
    {
        return $this->call($model, 'create', [$values]);
    }

    public function write(string $model, int $id, array $values): bool
    {
        return $this->call($model, 'write', [[$id], $values]);
    }

    public function read(string $model, int $id, array $fields = []): array
    {
        $results = $this->call($model, 'read', [[$id]], ['fields' => $fields]);
        return $results[0] ?? [];
    }

    public function getSupplier(int $odooId): array
    {
        return $this->read('terrain.supplier', $odooId, [
            'name', 'supplier_code', 'certifications', 'state', 'farm_count', 'lot_count',
        ]);
    }

    public function getFarms(int $supplierId): array
    {
        return $this->searchRead('terrain.farm', [['supplier_id', '=', $supplierId]], [
            'name', 'region', 'zone', 'altitude_min', 'altitude_max', 'state', 'farmer_count',
        ]);
    }

    public function getLots(int $supplierId): array
    {
        return $this->searchRead('terrain.coffee.lot', [['supplier_id', '=', $supplierId]], [
            'lot_code', 'name', 'grade', 'process', 'export_ready_date', 'has_price_breakdown',
        ]);
    }
}
