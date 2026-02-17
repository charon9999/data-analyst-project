// ============================================
// Anurag Meshram Portfolio - Main JS
// ============================================
document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile Navigation ---
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      // Skip dropdown parent links on mobile (they toggle the submenu)
      if (link.parentElement.classList.contains('nav-dropdown')) return;
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
    // Close submenu links on mobile
    navLinks.querySelectorAll('.nav-dropdown-menu a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  // --- Mobile dropdown toggle ---
  document.querySelectorAll('.nav-dropdown > a').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024) {
        e.preventDefault();
        trigger.closest('.nav-dropdown').classList.toggle('open');
      }
    });
  });

  // --- Navbar scroll ---
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });

  // --- Scroll animations ---
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.fade-in, .stagger-children').forEach(el => observer.observe(el));

  // --- Active nav link (with dropdown parent highlighting) ---
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a:not(.nav-resume-btn)').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
      // If this link is inside a dropdown menu, also highlight the parent
      const dropdown = link.closest('.nav-dropdown');
      if (dropdown) {
        dropdown.querySelector(':scope > a').classList.add('active');
      }
    }
  });

  // --- Code Viewer Toggle ---
  document.querySelectorAll('.code-viewer-header').forEach(header => {
    header.addEventListener('click', () => {
      header.closest('.code-viewer').classList.toggle('open');
    });
  });

});
