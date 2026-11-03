
const projectGrid = document.querySelector('#project-grid');
const form = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');

document.querySelector('#year').textContent =
  new Date().getFullYear();

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

async function loadProjects() {
  try {
    const response = await fetch('./projects.json');

    if (!response.ok) {
      throw new Error('Unable to load projects');
    }

    const projects = await response.json();
    projectGrid.replaceChildren();

    projects.forEach((project, index) => {
      const card = element('article', 'project-card');

      card.append(element('span', 'project-number',
        String(index + 1).padStart(2, '0')));
      card.append(element('span', 'project-type',
        project.category));
      card.append(element('h3', '', project.title));
      card.append(element('p', '', project.description));

      const tags = element('div', 'project-tags');

      (project.technologies || []).forEach(tech => {
        tags.append(element('span', '', tech));
      });

      card.append(tags);

      if (project.link &&
          /^https?:\/\//.test(project.link)) {
        const link = element('a', 'project-link',
          'View project ↗');
        link.href = project.link;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        card.append(link);
      }

      projectGrid.append(card);
    });

  } catch (error) {
    projectGrid.textContent =
      'Could not load projects. Please refresh the page.';
    console.error(error);
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();

  const data = Object.fromEntries(new FormData(form));

  const subject = encodeURIComponent(
    'Portfolio message from ' + data.name
  );

  const body = encodeURIComponent(
    data.message + '\n\nFrom: ' +
    data.name + ' (' + data.email + ')'
  );

  window.location.href =
    'mailto:haideraliparachawork123@gmail.com?subject=' +
    subject + '&body=' + body;

  formStatus.textContent =
    'Your email app should open. Press Send to finish.';
});

loadProjects();

.hero-copy {
  position: relative;
  z-index: 2;
}

.hero-art .orbit,
.hero-art .floating-tag {
  pointer-events: none;
}

.social-links a {
  position: relative;
  z-index: 3;
  cursor: pointer;
}
