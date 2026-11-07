<?php

namespace App\Http\Middleware;

use App\Models\Supplier;
use Closure;
use Illuminate\Http\Request;

class RequireSupplierAuth
{
    public function handle(Request $request, Closure $next)
    {
        $supplierId = session('supplier_id');

        if (!$supplierId) {
            return redirect('/login');
        }

        $supplier = Supplier::find($supplierId);

        if (!$supplier) {
            session()->forget('supplier_id');
            return redirect('/login');
        }

        $request->attributes->set('supplier', $supplier);

        return $next($request);
    }
}
