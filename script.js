document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('nav a');
  const backgroundAudio = document.getElementById('background-audio');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const preloader = document.getElementById('preloader');
  const videoElement = document.querySelector('.video-background video');
  const fallbackImage = document.querySelector('.video-background .fallback-img');
  const sections = document.querySelectorAll('main section');
  const welcomeContent = document.querySelector('#welcome .welcome-content');
  const welcomeH2 = welcomeContent.querySelector('h2');
  const welcomeP = welcomeContent.querySelector('p');
  const scrollDownLink = welcomeContent.querySelector('.scroll-down-link');

  let isAudioPlaying = false;
  let userHasInteracted = false; // Flag to track user interaction for autoplay policies

  // --- Preloader Logic ---
  window.addEventListener('load', () => {
    // Ensure preloader stays for a minimum time for smooth transition
    setTimeout(() => {
      preloader.classList.add('hidden');
      document.body.style.overflow = 'auto'; // Allow scrolling after preloader hides
      initializeContentAnimations();
    }, 1500); // Minimum 1.5 seconds preloader display
  });

  // --- Video Fallback Logic ---
  if (videoElement) {
    videoElement.onerror = () => {
      console.error("Video failed to load or play. Using fallback image.");
      videoElement.style.display = 'none';
      fallbackImage.style.display = 'block';
    };
    videoElement.onended = () => {
      if (!videoElement.loop) {
        videoElement.style.display = 'none';
        fallbackImage.style.display = 'block';
      }
    };
  }

  // --- Audio Control Logic ---
  const toggleAudio = () => {
    if (isAudioPlaying) {
      backgroundAudio.pause();
      playPauseBtn.textContent = '🎵'; // Play icon
    } else {
      backgroundAudio.volume = 0.2; // Keep volume subtle
      backgroundAudio.play()
        .then(() => {
          playPauseBtn.textContent = '🔇'; // Muted icon
        })
        .catch(error => {
          console.warn("Audio play prevented:", error);
          playPauseBtn.textContent = '🎵'; // Fallback to play icon if auto-play fails
        });
    }
    isAudioPlaying = !isAudioPlaying;
  };

  playPauseBtn.addEventListener('click', () => {
    userHasInteracted = true; // Mark interaction on button click
    toggleAudio();
  });

  // Global interaction listener for autoplay policies
  // Any click on the body will attempt to start audio if not already playing
  document.body.addEventListener('click', () => {
    if (!userHasInteracted && !isAudioPlaying) {
      userHasInteracted = true;
      backgroundAudio.volume = 0.2;
      backgroundAudio.play().then(() => {
        isAudioPlaying = true;
        playPauseBtn.textContent = '🔇';
      }).catch(e => console.warn("Audio could not play after first click:", e));
    }
  }, { once: true }); // Only run this once

  // --- Content Visibility Animations (on scroll and initial load) ---
  function initializeContentAnimations() {
    // Animate welcome content
    welcomeH2.style.animation = 'scaleIn 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards';
    welcomeH2.style.animationDelay = '0.5s'; // Relative to preloader hide
    welcomeP.style.animation = 'fadeIn 1.5s ease-out forwards';
    welcomeP.style.animationDelay = '1s';
    scrollDownLink.style.animation = 'fadeIn 1.5s ease-out forwards';
    scrollDownLink.style.animationDelay = '1.5s';

    // Observe other sections for scroll-in animation
    const observerOptions = {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0.2 // Trigger when 20% of the section is visible
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // If it's the welcome section, its content is already animated
          if (entry.target.id === 'welcome') {
            entry.target.querySelector('.welcome-content').classList.add('visible');
          } else {
            entry.target.querySelector('.section-content').classList.add('visible');
          }
          // Optional: stop observing once animated to save resources
          // observer.unobserve(entry.target);
        } else {
          // Optional: if you want them to hide when scrolled out of view
          // entry.target.querySelector('.section-content').classList.remove('visible');
        }
      });
    }, observerOptions);

    sections.forEach(section => {
      sectionObserver.observe(section);
    });
  }

  // --- Navigation Highlighting based on Scroll Position ---
  const headerHeight = document.querySelector('header').offsetHeight;

  const updateActiveNavLink = () => {
    let currentActiveSectionId = '';
    // Iterate in reverse to find the section currently at the top of the viewport
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const rect = section.getBoundingClientRect();
      // Consider a section "active" if its top is within the header height from the viewport top
      // and a good portion of it is visible.
      if (rect.top <= headerHeight + 50 && rect.bottom > headerHeight + 50) {
        currentActiveSectionId = section.id;
        break;
      }
    }

    navLinks.forEach(link => {
      link.classList.remove('current'); // Remove current from all
      if (link.getAttribute('href') === `#${currentActiveSectionId}`) {
        link.classList.add('current'); // Add current to the active one
      }
    });

    // Special case for welcome section: no nav link for it, so no 'current'
    if (currentActiveSectionId === 'welcome') {
        navLinks.forEach(link => link.classList.remove('current'));
    }
  };

  // Listen for scroll events to update active navigation link
  window.addEventListener('scroll', updateActiveNavLink);
  // Also call it once on load to set initial state
  updateActiveNavLink();

  // Handle smooth scroll for nav links (they are standard anchor links now)
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      userHasInteracted = true; // Mark interaction on nav click
      const targetId = link.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        // Scroll to the target section, accounting for fixed header
        const offsetTop = targetSection.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // Handle smooth scroll for "Scroll Down" and "Next Section" links
  document.querySelectorAll('.scroll-down-link, .next-section-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      userHasInteracted = true; // Mark interaction
      const targetId = link.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        const offsetTop = targetSection.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

});