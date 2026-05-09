<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = htmlspecialchars($_POST['name'] ?? '');
    $phone = htmlspecialchars($_POST['phone'] ?? '');
    $email = htmlspecialchars($_POST['email'] ?? '');
    $message = htmlspecialchars($_POST['message'] ?? '');
    
    $to = "info@upgrade-dance.ru";
    $subject = "Заявка с сайта UpGRADE";
    $body = "Имя: $name\nТелефон: $phone\nEmail: $email\nСообщение: $message";
    $headers = "From: site@upgrade-dance.ru\r\nReply-To: $email";
    
    if (mail($to, $subject, $body, $headers)) {
        echo json_encode(["success" => true, "message" => "Сообщение отправлено!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Ошибка отправки"]);
    }
}
?>