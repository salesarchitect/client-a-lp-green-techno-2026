/**
 * 株式会社グリーンテクノ LP - script.js
 * ========================================================
 * 1. FAQ アコーディオン
 * 2. スクロール連動（ヘッダー影 / ページトップボタン）
 * 3. Intersection Observer による Fade-in アニメーション
 * 4. スムーズスクロール（アンカーリンク）
 * 5. フォームバリデーション（HTML5 + カスタム）
 * 6. ナビ アクティブ状態（スクロール連動）
 */

'use strict';

/* ==========================================================================
   DOMContentLoaded
   ========================================================================== */
document.addEventListener('DOMContentLoaded', function() {
    initFAQ();
    initScrollBehavior();
    initFadeIn();
    initSmoothScroll();
    initFormValidation();
    initNavHighlight();
});

/* ==========================================================================
   1. FAQ アコーディオン
   ========================================================================== */
function initFAQ() {
    var faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(function(item) {
        var button = item.querySelector('.faq-q');
        var answer = item.querySelector('.faq-a');

        if (!button || !answer) return;

        button.addEventListener('click', function() {
            var isActive = item.classList.contains('active');

            // 他をすべて閉じる
            faqItems.forEach(function(other) {
                if (other !== item) {
                    other.classList.remove('active');
                    var otherBtn = other.querySelector('.faq-q');
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                }
            });

            // 自分をトグル
            item.classList.toggle('active', !isActive);
            button.setAttribute('aria-expanded', String(!isActive));
        });
    });
}

/* ==========================================================================
   2. スクロール連動
   ========================================================================== */
function initScrollBehavior() {
    var header = document.getElementById('header');
    var backToTop = document.getElementById('back-to-top');

    if (!header && !backToTop) return;

    var onScroll = function() {
        var scrollY = window.scrollY || window.pageYOffset;

        if (header) {
            if (scrollY > 60) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        if (backToTop) {
            if (scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    if (backToTop) {
        backToTop.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

/* ==========================================================================
   3. Fade-in アニメーション（Intersection Observer）
   ========================================================================== */
function initFadeIn() {
    var targets = document.querySelectorAll('.fade-in');
    if (!targets.length) return;

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
        targets.forEach(function(el) { el.classList.add('visible'); });
        return;
    }

    var observer = new IntersectionObserver(
        function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.08,
            rootMargin: '0px 0px -32px 0px',
        }
    );

    targets.forEach(function(el) { observer.observe(el); });
}

/* ==========================================================================
   4. スムーズスクロール（アンカーリンク）
   ========================================================================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var href = this.getAttribute('href');
            if (!href || href === '#') return;

            var target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            var header = document.getElementById('header');
            var headerHeight = header ? header.offsetHeight : 0;
            var targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 8;

            window.scrollTo({
                top: Math.max(0, targetTop),
                behavior: 'smooth',
            });

            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
        });
    });
}

/* ==========================================================================
   5. フォームバリデーション
   ========================================================================== */
function initFormValidation() {
    var form = document.getElementById('contact-form');
    var submitBtn = document.getElementById('submit-btn');

    if (!form || !submitBtn) return;

    var rules = {
        company: { required: true, label: '会社名' },
        name:    { required: true, label: 'ご担当者名' },
        phone:   {
            required: true,
            label: '電話番号',
            pattern: /^[\d\-\(\)\+\s]{10,20}$/,
            patternMsg: '正しい電話番号の形式で入力してください',
        },
        email:   {
            required: true,
            label: 'メールアドレス',
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            patternMsg: '正しいメールアドレスの形式で入力してください',
        },
    };

    Object.keys(rules).forEach(function(name) {
        var field = form.elements[name];
        if (!field) return;

        field.addEventListener('blur', function() { validateField(field, rules[name]); });
        field.addEventListener('input', function() { clearError(field); });
    });

    form.addEventListener('submit', function(e) {
        var isValid = true;

        Object.keys(rules).forEach(function(name) {
            var field = form.elements[name];
            if (!field) return;
            if (!validateField(field, rules[name])) {
                isValid = false;
            }
        });

        if (!isValid) {
            e.preventDefault();
            var firstError = form.querySelector('.error');
            if (firstError) firstError.focus();
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i> 送信中...';
    });
}

function validateField(field, rule) {
    clearError(field);
    var value = field.value.trim();

    if (rule.required && !value) {
        showError(field, rule.label + 'を入力してください');
        return false;
    }

    if (value && rule.pattern && !rule.pattern.test(value)) {
        showError(field, rule.patternMsg || '入力内容を確認してください');
        return false;
    }

    return true;
}

function showError(field, message) {
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');

    var existing = field.parentElement.querySelector('.field-error');
    if (existing) existing.remove();

    var errEl = document.createElement('p');
    errEl.className = 'field-error';
    errEl.setAttribute('role', 'alert');
    errEl.innerHTML = '<i class="fa-solid fa-circle-exclamation" aria-hidden="true"></i> ' + message;
    field.insertAdjacentElement('afterend', errEl);
}

function clearError(field) {
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
    var errEl = field.parentElement.querySelector('.field-error');
    if (errEl) errEl.remove();
}

/* ==========================================================================
   6. ナビ アクティブ状態（スクロール連動）
   ========================================================================== */
function initNavHighlight() {
    var navLinks = document.querySelectorAll('.header-nav a[href^="#"]');
    if (!navLinks.length) return;

    var sections = [];
    navLinks.forEach(function(link) {
        var id = link.getAttribute('href').slice(1);
        var section = document.getElementById(id);
        if (section) sections.push({ link: link, section: section });
    });

    var onScroll = function() {
        var scrollY = window.scrollY + 120;
        var current = null;

        sections.forEach(function(item) {
            if (item.section.offsetTop <= scrollY) {
                current = item.section.id;
            }
        });

        sections.forEach(function(item) {
            if (item.section.id === current) {
                item.link.setAttribute('aria-current', 'true');
                item.link.style.color = 'var(--c-secondary)';
            } else {
                item.link.removeAttribute('aria-current');
                item.link.style.color = '';
            }
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}
