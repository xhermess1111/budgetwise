<?php
$pageTitle = 'BudgetWise Calculator (PHP Demo)';
$currency = $_POST['currency'] ?? 'USD';
$currencySymbols = [
  'USD' => '$',
  'EUR' => '€',
  'GBP' => '£',
  'AUD' => 'A$',
  'CAD' => 'C$',
  'JPY' => '¥',
  'SGD' => 'S$'
];

$result = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $income = floatval($_POST['income'] ?? 0);
  $housing = floatval($_POST['housing'] ?? 0);
  $food = floatval($_POST['food'] ?? 0);
  $transportation = floatval($_POST['transportation'] ?? 0);
  $utilities = floatval($_POST['utilities'] ?? 0);
  $entertainment = floatval($_POST['entertainment'] ?? 0);
  $other = floatval($_POST['other'] ?? 0);

  $totalExpenses = $housing + $food + $transportation + $utilities + $entertainment + $other;
  $remainingBalance = $income - $totalExpenses;
  $savingsRate = $income > 0 ? round(($remainingBalance / $income) * 100, 1) : 0;

  $result = [
    'income' => $income,
    'totalExpenses' => $totalExpenses,
    'remainingBalance' => $remainingBalance,
    'savingsRate' => $savingsRate,
    'currency' => $currency,
    'symbol' => $currencySymbols[$currency] ?? '$'
  ];
}
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
          <li><a href="goals.php" class="nav-link">Goals demo</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main>
    <section class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">PHP calculator demo</span>
          <h1>Server-side savings calculation</h1>
          <p>This example processes the calculator form with PHP instead of JavaScript.</p>
        </div>

        <div class="container calculator-grid" style="margin-top: 2rem;">
          <form method="post" class="calculator-form">
            <div class="field-group">
              <label for="currency">Currency</label>
              <select id="currency" name="currency" class="currency-select">
                <option value="USD" <?= $currency === 'USD' ? 'selected' : '' ?>>USD - $</option>
                <option value="EUR" <?= $currency === 'EUR' ? 'selected' : '' ?>>EUR - €</option>
                <option value="GBP" <?= $currency === 'GBP' ? 'selected' : '' ?>>GBP - £</option>
                <option value="AUD" <?= $currency === 'AUD' ? 'selected' : '' ?>>AUD - A$</option>
                <option value="CAD" <?= $currency === 'CAD' ? 'selected' : '' ?>>CAD - C$</option>
                <option value="JPY" <?= $currency === 'JPY' ? 'selected' : '' ?>>JPY - ¥</option>
                <option value="SGD" <?= $currency === 'SGD' ? 'selected' : '' ?>>SGD - S$</option>
              </select>
            </div>
            <div class="field-group">
              <label for="income">Monthly Income</label>
              <input type="number" id="income" name="income" min="0" step="0.01" value="<?= isset($_POST['income']) ? htmlspecialchars($_POST['income']) : '' ?>" required />
            </div>
            <div class="field-group">
              <label for="housing">Housing</label>
              <input type="number" id="housing" name="housing" min="0" step="0.01" value="<?= isset($_POST['housing']) ? htmlspecialchars($_POST['housing']) : '' ?>" required />
            </div>
            <div class="field-group">
              <label for="food">Food</label>
              <input type="number" id="food" name="food" min="0" step="0.01" value="<?= isset($_POST['food']) ? htmlspecialchars($_POST['food']) : '' ?>" required />
            </div>
            <div class="field-group">
              <label for="transportation">Transportation</label>
              <input type="number" id="transportation" name="transportation" min="0" step="0.01" value="<?= isset($_POST['transportation']) ? htmlspecialchars($_POST['transportation']) : '' ?>" required />
            </div>
            <div class="field-group">
              <label for="utilities">Utilities</label>
              <input type="number" id="utilities" name="utilities" min="0" step="0.01" value="<?= isset($_POST['utilities']) ? htmlspecialchars($_POST['utilities']) : '' ?>" required />
            </div>
            <div class="field-group">
              <label for="entertainment">Entertainment</label>
              <input type="number" id="entertainment" name="entertainment" min="0" step="0.01" value="<?= isset($_POST['entertainment']) ? htmlspecialchars($_POST['entertainment']) : '' ?>" required />
            </div>
            <div class="field-group">
              <label for="other">Other Expenses</label>
              <input type="number" id="other" name="other" min="0" step="0.01" value="<?= isset($_POST['other']) ? htmlspecialchars($_POST['other']) : '' ?>" required />
            </div>
            <button type="submit" class="btn btn-primary">Calculate with PHP</button>
          </form>

          <div class="calculator-output">
            <?php if ($result): ?>
              <div class="output-card">
                <h3>Total Expenses</h3>
                <p class="output-value"><?= htmlspecialchars($result['symbol']) ?><?= number_format($result['totalExpenses'], 2) ?></p>
              </div>
              <div class="output-card">
                <h3>Remaining Balance</h3>
                <p class="output-value"><?= htmlspecialchars($result['symbol']) ?><?= number_format($result['remainingBalance'], 2) ?></p>
              </div>
              <div class="output-card">
                <h3>Savings Rate</h3>
                <p class="output-value"><?= number_format($result['savingsRate'], 1) ?>%</p>
              </div>
            <?php else: ?>
              <div class="output-card">
                <h3>Ready</h3>
                <p class="output-value">Fill out the form to calculate your savings.</p>
              </div>
            <?php endif; ?>
          </div>
        </div>
      </div>
    </section>
  </main>
</body>
</html>
