
const projectGrid = document.querySelector('#project-grid');
const form = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');

// Update footer year
const year = document.querySelector('#year');

if (year) {
  year.textContent = new Date().getFullYear();
}

// Helper function
function element(tag, className, text) {
  const node = document.createElement(tag);

  if (className) {
    node.className = className;
  }

  if (text !== undefined) {
    node.textContent = text;
  }

  return node;
}

// Load portfolio projects
async function loadProjects() {
  if (!projectGrid) return;

  try {
    const response = await fetch('./projects.json');

    if (!response.ok) {
      throw new Error('Unable to load projects');
    }

    const projects = await response.json();

    projectGrid.replaceChildren();

    projects.forEach((project, index) => {
      const card = element('article', 'project-card');

      card.append(
        element(
          'span',
          'project-number',
          String(index + 1).padStart(2, '0')
        )
      );

      card.append(
        element('span', 'project-type', project.category)
      );

      card.append(
        element('h3', '', project.title)
      );

      card.append(
        element('p', '', project.description)
      );

      const tags = element('div', 'project-tags');

      (project.technologies || []).forEach(tech => {
        tags.append(element('span', '', tech));
      });

      card.append(tags);

      if (
        project.link &&
        /^https?:\/\//.test(project.link)
      ) {
        const link = element(
          'a',
          'project-link',
          'View Project ↗'
        );

        link.href = project.link;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';

        card.append(link);
      }

      projectGrid.append(card);
    });

  } catch (error) {
    console.error(error);

    projectGrid.textContent =
      'Unable to load projects.';
  }
}

// CONTACT FORM - OPEN GMAIL
if (form) {
  form.addEventListener('submit', function(event) {

    // Stop page from refreshing
    event.preventDefault();

    // Read form values
    const name = form.elements['name'].value.trim();
    const email = form.elements['email'].value.trim();
    const message = form.elements['message'].value.trim();

    // Check empty fields
    if (!name || !email || !message) {
      alert('Please fill in all fields.');
      return;
    }

    // Your Gmail address
    const myEmail = 'haideraliparachawork123@gmail.com';

    // Email subject
    const subject = encodeURIComponent(
      'Portfolio Message from ' + name
    );

    // Email body
    const body = encodeURIComponent(
      'Name: ' + name +
      '\nEmail: ' + email +
      '\n\nMessage:\n' + message
    );

    // Create Gmail compose URL
    const gmailURL =
      'https://mail.google.com/mail/?view=cm&fs=1' +
      '&to=' + encodeURIComponent(myEmail) +
      '&su=' + subject +
      '&body=' + body;

    // Show feedback
    if (formStatus) {
      formStatus.textContent = 'Opening Gmail...';
    }

    // Open Gmail in SAME tab
    window.location.href = gmailURL;

  });
}

// Initialize portfolio projects
loadProjects();
