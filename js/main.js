/* Casa Liora — main.js */

(function () {
  'use strict';

  /* ─── NAVBAR SCROLL ──────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ─── MOBILE MENU ────────────────────────────────────────── */
  const menuBtn   = document.getElementById('menu-btn');
  const closeBtn  = document.getElementById('menu-close');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  if (closeBtn && mobileMenu) {
    closeBtn.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // Close on link click
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ─── ACTIVE NAV LINK ────────────────────────────────────── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPage || (currentPage === '' && href === 'index.html'))) {
      link.classList.add('active');
    }
  });

  /* ─── SMOOTH SCROLL ──────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ─── SCROLL REVEAL ──────────────────────────────────────── */
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    revealObserver.observe(el);
  });

  /* ─── BACK TO TOP ────────────────────────────────────────── */
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ─── HERO PARALLAX (subtle) ─────────────────────────────── */
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const offset = window.scrollY * 0.3;
      heroBg.style.transform = `translateY(${offset}px)`;
    }, { passive: true });
  }

  /* ─── PRODUCT IMAGE GALLERY ──────────────────────────────── */
  const mainImg = document.getElementById('main-product-img');
  const thumbnails = document.querySelectorAll('.thumbnail-wrap');

  if (mainImg && thumbnails.length) {
    thumbnails.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const src = thumb.querySelector('img').getAttribute('src');
        const alt = thumb.querySelector('img').getAttribute('alt');

        // Fade transition
        mainImg.style.opacity = '0';
        setTimeout(() => {
          mainImg.setAttribute('src', src);
          mainImg.setAttribute('alt', alt);
          mainImg.style.opacity = '1';
        }, 200);

        thumbnails.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
  }

  /* ─── COLLECTION FILTER ──────────────────────────────────── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const collectionGrid = document.getElementById('collection-grid');
  const productCards = collectionGrid
    ? Array.from(collectionGrid.querySelectorAll('.product-card[data-material]'))
    : [];
  const pagination = document.getElementById('collection-pagination');
  const paginationPrev = document.getElementById('pagination-prev');
  const paginationNext = document.getElementById('pagination-next');
  const paginationPages = document.getElementById('pagination-pages');
  const cardsPerPage = 3;
  let activeFilter = 'all';
  let currentCollectionPage = 1;

  const stylePaginationArrow = (button, disabled) => {
    button.disabled = disabled;
    button.style.opacity = disabled ? '0.45' : '1';
    button.style.cursor = disabled ? 'not-allowed' : 'pointer';
  };

  const stylePaginationPageButton = (button, active) => {
    button.className = 'w-9 h-9 flex items-center justify-center text-xs font-medium border transition-colors';
    button.style.borderColor = active ? 'var(--black)' : 'var(--beige)';
    button.style.background = active ? 'var(--black)' : 'transparent';
    button.style.color = active ? 'white' : 'var(--mid-gray)';
  };

  const getFilteredCollectionCards = () => {
    return productCards.filter(card => activeFilter === 'all' || card.dataset.material === activeFilter);
  };

  const updateCollectionPagination = totalPages => {
    if (!pagination || !paginationPages || !paginationPrev || !paginationNext) {
      return;
    }

    paginationPages.innerHTML = '';

    for (let page = 1; page <= totalPages; page += 1) {
      const pageButton = document.createElement('button');
      pageButton.type = 'button';
      pageButton.textContent = page;
      stylePaginationPageButton(pageButton, page === currentCollectionPage);
      pageButton.addEventListener('click', () => {
        if (page === currentCollectionPage) {
          return;
        }

        currentCollectionPage = page;
        renderCollectionPage(true);
      });
      paginationPages.appendChild(pageButton);
    }

    stylePaginationArrow(paginationPrev, currentCollectionPage === 1);
    stylePaginationArrow(paginationNext, currentCollectionPage === totalPages);
    pagination.style.display = totalPages > 1 ? 'flex' : 'none';
  };

  const renderCollectionPage = shouldScroll => {
    if (!productCards.length) {
      return;
    }

    const filteredCards = getFilteredCollectionCards();
    const totalPages = Math.max(1, Math.ceil(filteredCards.length / cardsPerPage));

    if (currentCollectionPage > totalPages) {
      currentCollectionPage = totalPages;
    }

    const startIndex = (currentCollectionPage - 1) * cardsPerPage;
    const visibleCards = filteredCards.slice(startIndex, startIndex + cardsPerPage);

    productCards.forEach(card => {
      const isVisible = visibleCards.includes(card);
      card.style.display = isVisible ? '' : 'none';
      card.classList.toggle('visible', isVisible);
    });

    updateCollectionPagination(totalPages);

    if (shouldScroll && collectionGrid) {
      collectionGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (paginationPrev && paginationNext && productCards.length) {
    paginationPrev.addEventListener('click', () => {
      if (currentCollectionPage === 1) {
        return;
      }

      currentCollectionPage -= 1;
      renderCollectionPage(true);
    });

    paginationNext.addEventListener('click', () => {
      const totalPages = Math.max(1, Math.ceil(getFilteredCollectionCards().length / cardsPerPage));
      if (currentCollectionPage >= totalPages) {
        return;
      }

      currentCollectionPage += 1;
      renderCollectionPage(true);
    });
  }

  if (filterBtns.length && productCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.filter;
        currentCollectionPage = 1;

        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderCollectionPage(false);
      });
    });

    renderCollectionPage(false);
  }

  /* ─── NEWSLETTER FORM ────────────────────────────────────── */
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const btn   = form.querySelector('button[type="submit"]');
      if (input && input.value) {
        const originalText = btn.textContent;
        btn.textContent = 'Thank You!';
        btn.disabled = true;
        input.value = '';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
        }, 3000);
      }
    });
  });

  /* ─── CONTACT FORM ───────────────────────────────────────── */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = 'Message Sent!';
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        contactForm.reset();
      }, 3500);
    });
  }

  /* ─── LAZY LOAD IMAGES ───────────────────────────────────── */
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      if (img.dataset.src) img.src = img.dataset.src;
    });
  } else {
    // Fallback IntersectionObserver
    const lazyObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          lazyObserver.unobserve(img);
        }
      });
    });
    document.querySelectorAll('img[data-src]').forEach(img => lazyObserver.observe(img));
  }

  /* ─── QUANTITY SELECTOR ──────────────────────────────────── */
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus  = document.getElementById('qty-plus');
  const qtyInput = document.getElementById('qty-input');

  if (qtyMinus && qtyPlus && qtyInput) {
    qtyMinus.addEventListener('click', () => {
      const val = parseInt(qtyInput.value, 10);
      if (val > 1) qtyInput.value = val - 1;
    });
    qtyPlus.addEventListener('click', () => {
      const val = parseInt(qtyInput.value, 10);
      if (val < 10) qtyInput.value = val + 1;
    });
  }

  /* ─── MAIN IMG FADE STYLE ────────────────────────────────── */
  if (mainImg) {
    mainImg.style.transition = 'opacity 0.2s ease';
  }

})();
