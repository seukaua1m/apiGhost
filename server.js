<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    echo json_encode(["error" => "Método não permitido, use GET"]);
    exit;
}

// ----------------------------
// Descobre tipo e valor (path ou query string)
// ----------------------------
$request_path = trim(parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH), "/");
$partes = explode("/", $request_path);

// Valores default
$tipo = null;
$valor = null;

// 1) Se tiver query string (?cpf= ou ?cep=)
if (!empty($_GET['cpf'])) {
    $tipo = "cpf";
    $valor = preg_replace('/\D/', '', $_GET['cpf']);
} elseif (!empty($_GET['cep'])) {
    $tipo = "cep";
    $valor = preg_replace('/\D/', '', $_GET['cep']);
}
// 2) Se não tiver query string, tenta path
elseif (count($partes) >= 2) {
    $tipo = strtolower($partes[0]);
    $valor = preg_replace('/\D/', '', $partes[1]);
} else {
    http_response_code(400);
    echo json_encode(["error" => "Informe CPF ou CEP"]);
    exit;
}

// ----------------------------
// Consulta CPF
// ----------------------------
if ($tipo === "cpf") {
    if (strlen($valor) !== 11) {
        http_response_code(400);
        echo json_encode(["error" => "CPF inválido"]);
        exit;
    }

    $url = "https://idomepuxadas.xyz/api/v1/cpf/09adfd94-ef8a-4783-a976-1f67efdcb9b6/" . $valor;
    $token = "4d65acfcd1da251426d90daa55184843e41e18cb6e331f20a3a1a7ec54ab677e";

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0");
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Accept: application/json",
        "Content-Type: application/json",
        "Authorization: Bearer {$token}"
    ]);

    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($response === false) {
        http_response_code(500);
        echo json_encode(["error" => "Erro ao acessar API externa", "detalhe" => $error]);
        exit;
    }

    $data = json_decode($response, true);

    if (!isset($data['data'])) {
        http_response_code($http_code);
        echo json_encode($data);
        exit;
    }

    $resultado = [
        "NOME"      => $data['data']['nome'] ?? '',
        "NOME_MAE"  => $data['data']['mae'] ?? '',
        "SEXO"      => $data['data']['sexo'] ?? '',
        "NASC"      => $data['data']['nascimento'] ?? ''
    ];

    http_response_code(200);
    echo json_encode($resultado);
    exit;
}

// ----------------------------
// Consulta CEP
// ----------------------------
if ($tipo === "cep") {
    if (strlen($valor) !== 8) {
        http_response_code(400);
        echo json_encode(["error" => "CEP inválido"]);
        exit;
    }

    $url = "https://viacep.com.br/ws/{$valor}/json/";

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    if ($response === false) {
        http_response_code(500);
        echo json_encode(["error" => "Erro ao consultar ViaCEP", "detalhe" => $error]);
        exit;
    }

    $data = json_decode($response, true);

    if (isset($data['erro'])) {
        http_response_code(404);
        echo json_encode(["error" => "CEP não encontrado"]);
        exit;
    }

    $resultado = [
        "CEP"        => $data['cep'] ?? '',
        "LOGRADOURO" => $data['logradouro'] ?? '',
        "BAIRRO"     => $data['bairro'] ?? '',
        "CIDADE"     => $data['localidade'] ?? '',
        "UF"         => $data['uf'] ?? ''
    ];

    http_response_code(200);
    echo json_encode($resultado);
    exit;
}

// ----------------------------
// Se não for nenhum dos dois
// ----------------------------
http_response_code(400);
echo json_encode(["error" => "Tipo inválido, use cpf ou cep"]);
