<?php
if(!function_exists('throw_exception')) {
    function throw_exception(int $code = 500, $data = null, string $target = null, bool $redirect = false)
    {
        $request = request();
        if($data && !is_array($data)) {
            if(in_array($code, [
                200,
                301
            ])) {
                session()->flash('success', $data);
            } elseif(in_array($code, [
                403,
                404
            ])) {
                session()->flash('warning', $data);
            } else {
                session()->flash('error', $data);
            }
        }
        if(!$request->ajax()) {
            return redirect()->route($target)->send();
        }
        $exception = [];
        if(is_array($data)) {
            foreach($data as $key => $val) {
                $key             = str_replace('[]', '', $key);
                $exception[$key] = $val;
            }
        } else {
            $exception = $data;
        }
        $output = [
            'code'     => $code,
            'message'  => $exception,
            'target'   => $target ?? '',
            'redirect' => $redirect,
        ];
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode($output);
        exit;
    }
}
