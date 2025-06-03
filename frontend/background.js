// Animation settings
const SHAPE_COUNT = 40;
const COLORS = ['#C4B5FD', '#DDD6FE', '#EDE9FE', '#8B5CF6', '#7C3AED'];
const ICONS = ['✓', '📋', '⭐', '📅', '🔔'];
const MAX_SIZE = 120;
const MIN_SIZE = 80;

// Create background container
function createBackgroundContainer() {
  const container = document.createElement('div');
  container.classList.add('animated-background');
  document.body.insertBefore(container, document.body.firstChild);
  return container;
}

// Create a task-themed floating element
function createTaskElement(container) {
  const element = document.createElement('div');
  const icon = ICONS[Math.floor(Math.random() * ICONS.length)];
  const size = MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE);
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  
  // Basic element styling
  element.classList.add('task-element');
  element.style.width = `${size}px`;
  element.style.height = `${size}px`;
  element.style.backgroundColor = color;
  element.innerHTML = icon;
  
  // Set random position
  element.style.left = `${Math.random() * 100}vw`;
  element.style.top = `${Math.random() * 100}vh`;
  
  // Set random opacity
  element.style.opacity = 0.4 + Math.random() * 0.3;
  
  // Set random animation duration and delay
  const duration = 20 + Math.random() * 40;
  const delay = Math.random() * 5;
  element.style.animationDuration = `${duration}s`;
  element.style.animationDelay = `${delay}s`;
  
  // Add to container
  container.appendChild(element);
  return element;
}

// Initialize floating animation
function initFloatingAnimation() {
  const container = createBackgroundContainer();
  
  // Create multiple elements
  for (let i = 0; i < SHAPE_COUNT; i++) {
    createTaskElement(container);
  }
  
  // Add mouse parallax effect
  document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    const elements = document.querySelectorAll('.task-element');
    elements.forEach((element, index) => {
      const factor = 0.01 + (index % 5) * 0.01;
      const x = (mouseX - 0.5) * factor * 100;
      const y = (mouseY - 0.5) * factor * 100;
      
      element.style.transition = 'transform 0.8s ease-out';
      element.style.transform = `translate(${x}px, ${y}px)`;
    });
  });
}

// Export the initialization function
export { initFloatingAnimation };