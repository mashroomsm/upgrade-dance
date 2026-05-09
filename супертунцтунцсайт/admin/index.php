<?php
session_start();
$password = 'upgrade123'; // Смените на надёжный пароль

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    if ($_POST['pass'] === $password) {
        $_SESSION['admin'] = true;
    }
}
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: index.php');
}

if (!isset($_SESSION['admin'])) {
    echo '<form method="post"><input type="password" name="pass" placeholder="Пароль"><button type="submit" name="login">Войти</button></form>';
    exit;
}

// Обновление расписания
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_schedule'])) {
    $schedule = json_decode($_POST['schedule_data'], true);
    file_put_contents('../data/schedule.json', json_encode($schedule, JSON_PRETTY_PRINT));
    echo '<p style="color:green">✅ Расписание обновлено!</p>';
}

$schedule = json_decode(file_get_contents('../data/schedule.json'), true);
?>

<h2>Админ-панель UpGRADE</h2>
<form method="post">
    <textarea name="schedule_data" rows="10" cols="80"><?= htmlspecialchars(json_encode($schedule, JSON_PRETTY_PRINT)) ?></textarea><br>
    <button type="submit" name="update_schedule">Сохранить расписание</button>
</form>
<a href="?logout=1">Выйти</a>