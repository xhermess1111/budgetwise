<?php
session_start();
$pageTitle = 'BudgetWise Goals (PHP Demo)';
$currencySymbols = [
  'USD' => '$',
  'EUR' => '€',
  'GBP' => '£',
  'AUD' => 'A$',
  'CAD' => 'C$',
  'JPY' => '¥',
  'SGD' => 'S$'
];

if (!isset($_SESSION['goals'])) {
  $_SESSION['goals'] = [];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $currency = $_POST['currency'] ?? 'USD';
  $title = trim($_POST['goalTitle'] ?? '');
  $target = floatval($_POST['goalTarget'] ?? 0);
  $current = floatval($_POST['goalCurrent'] ?? 0);

  if ($title !== '' && $target > 0) {
    $progress = $target > 0 ? round(($current / $target) * 100, 1) : 0;
    $_SESSION['goals'][] = [
      'currency' => $currency,
      'title' => $title,
      'target' => $target,
      'current' => $current,
      'progress' => $progress,
      'remaining' => $target - $current
    ];
  }
}
$goals = $_SESSION['goals'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><?= htmlspecialchars($pageTitle) ?></title>
  <link rel="stylesheet" href="../css/style.css" />
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <a href="../index.html" class="logo">BudgetWise</a>
      <nav class="nav-menu">
        <ul class="nav-list">
          <li><a href="index.php" class="nav-link">PHP demos</a></li>
          <li><a href="calculator.php" class="nav-link">Calculator demo</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main>
    <section class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">PHP goals demo</span>
          <h1>Track goals on the server using sessions</h1>
          <p>This example saves goals across requests with PHP sessions.</p>
        </div>

        <div class="container goal-toolbar" style="margin-top: 2rem;">
          <form method="post" class="goal-form">
            <div class="field-group">
              <label for="currency">Currency</label>
              <select id="currency" name="currency" class="currency-select">
                <option value="USD">USD - $</option>
                <option value="EUR">EUR - €</option>
                <option value="GBP">GBP - £</option>
                <option value="AUD">AUD - A$</option>
                <option value="CAD">CAD - C$</option>
                <option value="JPY">JPY - ¥</option>
                <option value="SGD">SGD - S$</option>
              </select>
            </div>
            <div class="field-group">
              <label for="goalTitle">Goal title</label>
              <input type="text" id="goalTitle" name="goalTitle" placeholder="Example: Save for a holiday" required />
            </div>
            <div class="field-group">
              <label for="goalTarget">Target amount</label>
              <input type="number" id="goalTarget" name="goalTarget" min="0" step="100" required />
            </div>
            <div class="field-group">
              <label for="goalCurrent">Current saved</label>
              <input type="number" id="goalCurrent" name="goalCurrent" min="0" step="100" required />
            </div>
            <button type="submit" class="btn btn-secondary">Save goal</button>
          </form>
        </div>

        <div class="container goals-grid" style="margin-top: 2rem;">
          <?php if (!empty($goals)): ?>
            <?php foreach ($goals as $index => $goal): ?>
              <article class="feature-card">
                <h3><?= htmlspecialchars($goal['title']) ?></h3>
                <p><strong>Target:</strong> <?= htmlspecialchars($currencySymbols[$goal['currency']] ?? '$') ?><?= number_format($goal['target'], 2) ?></p>
                <p><strong>Current:</strong> <?= htmlspecialchars($currencySymbols[$goal['currency']] ?? '$') ?><?= number_format($goal['current'], 2) ?></p>
                <p><strong>Progress:</strong> <?= number_format($goal['progress'], 1) ?>%</p>
                <p><strong>Remaining:</strong> <?= htmlspecialchars($currencySymbols[$goal['currency']] ?? '$') ?><?= number_format($goal['remaining'], 2) ?></p>
              </article>
            <?php endforeach; ?>
          <?php else: ?>
            <article class="feature-card">
              <h3>No goals yet</h3>
              <p>Use the form above to create your first PHP-powered goal card.</p>
            </article>
          <?php endif; ?>
        </div>
      </div>
    </section>
  </main>
</body>
</html>
