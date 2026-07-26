<?php
$pageTitle = 'BudgetWise PHP Examples';
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
    </div>
  </header>

  <main>
    <section class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">PHP demos</span>
          <h1>Local server examples for the calculator and savings goals.</h1>
          <p>These examples use PHP so you can see server-side processing. They work best on a local PHP server such as XAMPP, WAMP, MAMP, or <code>php -S localhost:8000</code>.</p>
          <p><strong>Note:</strong> GitHub Pages does not run PHP, so these demos are meant for local use or a PHP host later.</p>
        </div>

        <div class="container" style="display:grid; gap:1.5rem; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); margin-top:2rem;">
          <article class="feature-card">
            <h3>Calculator example</h3>
            <p>Submit income and expenses to compute total costs, remaining balance, and savings rate on the server.</p>
            <a href="calculator.php" class="btn btn-primary">Open calculator</a>
          </article>

          <article class="feature-card">
            <h3>Goal tracking example</h3>
            <p>Save a goal through a PHP form and see the progress update across requests using session storage.</p>
            <a href="goals.php" class="btn btn-secondary">Open goals demo</a>
          </article>
        </div>
      </div>
    </section>
  </main>
</body>
</html>
