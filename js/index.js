const qs = (selector, parent = document) => (parent || document).querySelector(selector);
const qsa = (selector, parent = document) => Array.from((parent || document).querySelectorAll(selector));

const CURRENCY_KEY = 'budgetwise-currency';

const getStoredCurrency = () => {
  try {
    return localStorage.getItem(CURRENCY_KEY) || 'PHP';
  } catch (error) {
    return 'PHP';
  }
};

let selectedCurrency = getStoredCurrency();
let refreshSavingsOutput = null;
let refreshGoalDisplay = null;

const formatCurrency = (amount, currency = selectedCurrency) => {
  const value = Number(amount) || 0;
  const isZeroDecimal = ['JPY'].includes(currency);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: isZeroDecimal ? 0 : 2,
  }).format(value);
};

const saveCurrency = currency => {
  selectedCurrency = currency;
  try {
    localStorage.setItem(CURRENCY_KEY, currency);
  } catch (error) {
    // ignore storage errors
  }
};

const initCurrencySelectors = () => {
  const currencySelectors = qsa('.currency-select');
  if (!currencySelectors.length) return;

  currencySelectors.forEach(select => {
    select.value = selectedCurrency;
    select.addEventListener('change', event => {
      const newCurrency = event.target.value;
      saveCurrency(newCurrency);
      currencySelectors.forEach(control => {
        control.value = newCurrency;
      });
      if (typeof refreshSavingsOutput === 'function') {
        refreshSavingsOutput();
      }
      if (typeof refreshGoalDisplay === 'function') {
        refreshGoalDisplay();
      }
    });
  });
};

const updateActiveLink = sections => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  qsa('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    if (href.startsWith('#')) {
      link.classList.toggle('active', currentPage === 'index.html' && sections.some(section => `#${section.id}` === href));
      return;
    }

    const linkPage = href.split('/').pop();
    link.classList.toggle('active', linkPage === currentPage || (linkPage === 'index.html' && currentPage === ''));
  });
};

const initSmoothScrolling = () => {
  qsa('.nav-link').forEach(link => {
    link.addEventListener('click', event => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      event.preventDefault();
      const targetId = href.slice(1);
      const targetEl = document.getElementById(targetId);

      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      const navMenu = qs('.nav-menu');
      if (navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        qs('.nav-toggle').setAttribute('aria-expanded', 'false');
      }
    });
  });
};

const initNavigationToggle = () => {
  const toggle = qs('.nav-toggle');
  const menu = qs('.nav-menu');

  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    menu.classList.toggle('active');
  });
};

const updateExpenseCategories = ({ income, housing, food, transportation, utilities, entertainment, other }) => {
  const categoryCards = qsa('.category-card');
  const totalExpenses = housing + food + transportation + utilities + entertainment + other;
  const remaining = Math.max(0, income - totalExpenses);
  const shareBase = income > 0 && remaining >= 0 ? income : Math.max(totalExpenses, 1);

  const values = {
    housing,
    food,
    transportation,
    entertainment,
    savings: remaining,
  };

  categoryCards.forEach(card => {
    const category = card.dataset.category?.toLowerCase();
    if (!category) return;

    const span = qs(`span[data-category="${category}"]`, card);
    const label = qs('.category-value', card);
    const amount = values[category] || 0;
    const percentage = Math.round((amount / shareBase) * 100);

    if (span) {
      span.style.setProperty('--progress', `${Math.min(100, percentage)}%`);
    }

    if (label) {
      if (category === 'savings' && remaining === 0) {
        label.textContent = '0%';
      } else {
        label.textContent = `${Math.min(100, Math.max(0, percentage))}%`;
      }
    }
  });
};

const initSavingsCalculator = () => {
  const form = qs('#savings-form');
  const message = qs('#calculator-message');
  const totalExpensesOutput = qs('#total-expenses');
  const remainingBalanceOutput = qs('#remaining-balance');
  const savingsRateOutput = qs('#savings-rate');

  if (!form || !message || !totalExpensesOutput || !remainingBalanceOutput || !savingsRateOutput) return;

  const currencySelect = qs('#currency', form);
  const getValue = id => parseFloat(qs(`#${id}`, form).value) || 0;
  const currentCurrency = () => currencySelect?.value || selectedCurrency;
  const calculateResults = () => {
    const income = getValue('income');
    const housing = getValue('housing');
    const food = getValue('food');
    const transportation = getValue('transportation');
    const utilities = getValue('utilities');
    const entertainment = getValue('entertainment');
    const other = getValue('other');
    const totalExpenses = housing + food + transportation + utilities + entertainment + other;
    const remaining = income - totalExpenses;
    const savingsRate = income > 0 ? Math.max(0, (remaining / income) * 100) : 0;
    const currency = currentCurrency();

    totalExpensesOutput.textContent = formatCurrency(totalExpenses, currency);
    remainingBalanceOutput.textContent = formatCurrency(remaining, currency);
    savingsRateOutput.textContent = `${Math.round(Math.max(0, savingsRate))}%`;
    updateExpenseCategories({ income, housing, food, transportation, utilities, entertainment, other });

    return { income, totalExpenses, remaining, currency };
  };

  const inputs = qsa('input[type="number"]', form);
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      const { income, remaining } = calculateResults();
      if (income <= 0) {
        message.textContent = 'Enter a valid monthly income to calculate your savings.';
        message.style.color = '#475569';
        return;
      }

      if (remaining > income * 0.2) {
        message.textContent = 'Great job! Your spending is well within budget and you have strong savings potential.';
        message.style.color = '#047857';
      } else if (remaining >= 0) {
        message.textContent = 'Good work! Consider reviewing small expense categories to increase savings further.';
        message.style.color = '#c2410c';
      } else {
        message.textContent = 'Warning: expenses exceed your income. Try reducing spending or increase your income to balance your budget.';
        message.style.color = '#b91c1c';
      }
    });
  });

  if (currencySelect) {
    currencySelect.addEventListener('change', () => {
      saveCurrency(currencySelect.value);
      calculateResults();
    });
  }

  refreshSavingsOutput = calculateResults;
  calculateResults();

  form.addEventListener('submit', event => {
    event.preventDefault();
    const { income, remaining } = calculateResults();

    if (income <= 0) {
      message.textContent = 'Enter a valid monthly income to calculate your savings.';
      message.style.color = '#b91c1c';
      return;
    }

    if (remaining > income * 0.2) {
      message.textContent = 'Great job! Your spending is well within budget and you have strong savings potential.';
      message.style.color = '#047857';
    } else if (remaining >= 0) {
      message.textContent = 'Good work! Consider reviewing small expense categories to increase savings further.';
      message.style.color = '#c2410c';
    } else {
      message.textContent = 'Warning: expenses exceed your income. Try reducing spending or increase your income to balance your budget.';
      message.style.color = '#b91c1c';
    }
  });
};

const initGoalTracker = () => {
  const goalForm = qs('#goal-form');
  const goalGrid = qs('#goals-grid');
  const goalFeedback = qs('#goal-feedback');

  if (!goalForm || !goalGrid || !goalFeedback) return;

  const storageKey = 'budgetwise-goals';
  const defaultGoals = [
    {
      title: 'Buy a Home',
      description: 'Save consistently for a down payment and stay focused on your long-term goal.',
      current: 56000,
      target: 80000,
      icon: 'house',
    },
    {
      title: 'Emergency Fund',
      description: 'Build a protective safety net that covers unexpected costs without pressure.',
      current: 2200,
      target: 4000,
      icon: 'shield-halved',
    },
    {
      title: 'Vacation',
      description: 'Plan ahead so your next trip is funded and stress-free.',
      current: 1400,
      target: 4000,
      icon: 'plane',
    },
    {
      title: 'Education',
      description: 'Save for training, certifications, or a degree that advances your career.',
      current: 2800,
      target: 12000,
      icon: 'user-graduate',
    },
  ];

  const loadGoals = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : defaultGoals;
    } catch (error) {
      return defaultGoals;
    }
  };

  const saveGoals = goals => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(goals));
    } catch (error) {
      // Ignore storage errors
    }
  };

  const goals = loadGoals();

  const renderGoals = () => {
    const currency = selectedCurrency;
    goalGrid.innerHTML = goals
      .map((goal, index) => {
        const progress = Math.min(100, Math.round((goal.current / Math.max(goal.target, 1)) * 100));
        const complete = progress >= 100;
        const savedLabel = `${formatCurrency(goal.current, currency)} / ${formatCurrency(goal.target, currency)}`;
        return `
          <article class="goal-card reveal" data-index="${index}">
            <div class="goal-icon"><i class="fas fa-${goal.icon || 'bullseye'}" aria-hidden="true"></i></div>
            <h3>${goal.title}</h3>
            <p>${goal.description}</p>
            <div class="goal-progress"><span style="--progress:${progress}%"></span></div>
            <div class="goal-details">
              <span class="goal-tracker">${savedLabel}</span>
              <div class="goal-actions">
                <button type="button" class="btn btn-secondary goal-action" data-action="progress" data-index="${index}" ${complete ? 'disabled' : ''}>${complete ? 'Completed' : 'Add progress'}</button>
                <button type="button" class="btn btn-secondary goal-action" data-action="edit" data-index="${index}">Edit</button>
                <button type="button" class="btn btn-danger goal-action" data-action="delete" data-index="${index}">Delete</button>
              </div>
            </div>
          </article>
        `;
      })
      .join('');

    saveGoals(goals);
  };

  goalGrid.addEventListener('click', event => {
    const button = event.target.closest('.goal-action');
    if (!button) return;

    const index = Number(button.dataset.index);
    const action = button.dataset.action;
    const goal = goals[index];
    if (!goal || Number.isNaN(index) || !action) return;

    if (action === 'progress') {
      const amountValue = prompt('Enter the amount you added toward this goal:', '500');
      if (amountValue === null) return;

      const amount = parseFloat(amountValue);
      if (Number.isNaN(amount) || amount <= 0) {
        goalFeedback.textContent = 'Enter a positive amount to update your goal progress.';
        goalFeedback.style.color = '#b91c1c';
        return;
      }

      goal.current = Math.min(goal.target, goal.current + amount);
      goalFeedback.textContent = `Nice work! Updated progress for ${goal.title}.`;
      goalFeedback.style.color = '#047857';
      renderGoals();
      return;
    }

    if (action === 'edit') {
      const newTitle = prompt('Update goal title:', goal.title) || goal.title;
      const newTargetValue = prompt('Update goal target amount:', goal.target.toString());
      if (newTargetValue === null) return;
      const newTarget = parseFloat(newTargetValue);
      if (Number.isNaN(newTarget) || newTarget <= 0) {
        goalFeedback.textContent = 'Enter a valid target amount to update the goal.';
        goalFeedback.style.color = '#b91c1c';
        return;
      }

      const newCurrentValue = prompt('Update current saved amount:', goal.current.toString());
      if (newCurrentValue === null) return;
      const newCurrent = Math.max(0, parseFloat(newCurrentValue));
      if (Number.isNaN(newCurrent)) {
        goalFeedback.textContent = 'Enter a valid current amount to update the goal.';
        goalFeedback.style.color = '#b91c1c';
        return;
      }

      goal.title = newTitle;
      goal.target = newTarget;
      goal.current = Math.min(newCurrent, newTarget);
      goalFeedback.textContent = `Goal updated: ${goal.title}.`;
      goalFeedback.style.color = '#047857';
      renderGoals();
      return;
    }

    if (action === 'delete') {
      const confirmed = confirm(`Remove the goal “${goal.title}” from your tracker?`);
      if (!confirmed) return;

      goals.splice(index, 1);
      goalFeedback.textContent = `Removed goal: ${goal.title}.`;
      goalFeedback.style.color = '#047857';
      renderGoals();
    }
  });

  goalForm.addEventListener('submit', event => {
    event.preventDefault();

    const title = qs('#goal-title', goalForm).value.trim();
    const target = parseFloat(qs('#goal-target', goalForm).value) || 0;
    const current = parseFloat(qs('#goal-current', goalForm).value) || 0;

    if (!title || target <= 0 || current < 0) {
      goalFeedback.textContent = 'Please enter a valid title, target, and current amount.';
      goalFeedback.style.color = '#b91c1c';
      return;
    }

    goals.push({
      title,
      description: 'Track your progress and celebrate each savings milestone.',
      current: Math.min(current, target),
      target,
      icon: 'bullseye',
    });

    goalFeedback.textContent = 'Your goal is added and ready to track.';
    goalFeedback.style.color = '#047857';
    goalForm.reset();
    qsa('.currency-select').forEach(select => {
      select.value = selectedCurrency;
    });
    renderGoals();
  });

  refreshGoalDisplay = renderGoals;
  renderGoals();
};

const initFaqAccordion = () => {
  qsa('.faq-item').forEach(item => {
    const button = qs('.faq-question', item);
    const answer = qs('.faq-answer', item);

    if (!button || !answer) return;

    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      answer.hidden = expanded;
    });
  });
};

const initContactForm = () => {
  const form = qs('#contact-form');
  const feedback = qs('#form-feedback');

  if (!form || !feedback) return;

  form.addEventListener('submit', event => {
    event.preventDefault();

    const name = qs('#contact-name', form).value.trim();
    const email = qs('#contact-email', form).value.trim();
    const message = qs('#contact-message', form).value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !message) {
      feedback.textContent = 'Please complete all fields before sending your message.';
      feedback.style.color = '#b91c1c';
      return;
    }

    if (!emailRegex.test(email)) {
      feedback.textContent = 'Please enter a valid email address.';
      feedback.style.color = '#b91c1c';
      return;
    }

    feedback.textContent = 'Thanks for reaching out! Your message has been received.';
    feedback.style.color = '#047857';
    form.reset();
  });
};

const initScrollReveal = () => {
  const revealElements = qsa('.reveal');
  const progressSpans = qsa('.progress-bar span, .goal-progress span');

  progressSpans.forEach(span => {
    const progressValue = span.style.getPropertyValue('--progress') || '0%';
    span.dataset.targetProgress = progressValue;
    span.style.setProperty('--progress', '0%');
  });

  if (typeof window.IntersectionObserver === 'undefined') {
    revealElements.forEach(element => element.classList.add('visible'));
    progressSpans.forEach(span => {
      span.style.setProperty('--progress', span.dataset.targetProgress || '0%');
    });
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const element = entry.target;
        element.classList.add('visible');

        if (element.matches('.progress-bar span, .goal-progress span')) {
          element.style.setProperty('--progress', element.dataset.targetProgress || '0%');
        }

        observer.unobserve(element);
      });
    },
    {
      threshold: 0.2,
    }
  );

  revealElements.forEach(element => observer.observe(element));
  progressSpans.forEach(span => observer.observe(span));
};

const init = () => {
  initNavigationToggle();
  initSmoothScrolling();
  initSavingsCalculator();
  initGoalTracker();
  initCurrencySelectors();
  initFaqAccordion();
  initContactForm();
  initScrollReveal();

  const sections = qsa('main section[id]');
  if (sections.length) {
    updateActiveLink(sections);
    window.addEventListener('scroll', () => updateActiveLink(sections));
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
