const heroFixes = document.createElement('link');
heroFixes.rel = 'stylesheet';
heroFixes.href = 'hero-fixes.css';
document.head.append(heroFixes);

const scene = document.querySelector('.title-scene');
if (scene) {
  const align = () => scene.classList.add('is-aligned');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) align();
  else window.setTimeout(align, 700);
}

const scenarios = {
  title: {
    label: 'Title exception',
    decision: 'Human review before action',
    summary: 'The agent may assemble evidence and recommend a next step, but a title exception changes legal and financial consequence. Human authority remains explicit.',
    receipt: 'STATE: HOLD\nREASON: unresolved title exception\nHUMAN AUTHORITY: title operations reviewer\nRECOVERY: request missing instrument / route to counsel',
    fields: [
      ['Intent', 'Resolve the title condition', 'clear'],
      ['Evidence', 'Exception record + source documents', 'clear'],
      ['Authority', 'Recommend only; do not clear', 'hold'],
      ['Exception', 'Ownership or lien ambiguity', 'stop'],
      ['Recovery', 'Route with evidence and next action', 'clear']
    ]
  },
  appraisal: {
    label: 'Appraisal scheduling',
    decision: 'Clear to act within bounded authority',
    summary: 'The agent can coordinate calendars, confirm preferences, and issue notifications when identity, availability, and escalation rules are explicit.',
    receipt: 'STATE: CLEAR TO ACT\nSCOPE: scheduling and confirmations\nHUMAN AUTHORITY: exception escalation\nRECOVERY: offer alternatives / transfer to coordinator',
    fields: [
      ['Intent', 'Schedule a verified appointment', 'clear'],
      ['Evidence', 'Availability + contact preferences', 'clear'],
      ['Authority', 'Book within defined constraints', 'clear'],
      ['Exception', 'Access or identity conflict', 'hold'],
      ['Recovery', 'Present alternatives or hand off', 'clear']
    ]
  },
  closing: {
    label: 'Closing disclosure',
    decision: 'Draft and validate; human releases',
    summary: 'Automation can reconcile data and surface changes, but release authority should remain visible when revisions affect regulated disclosures or borrower commitments.',
    receipt: 'STATE: CONTROLLED ASSIST\nSCOPE: reconcile, flag, prepare\nHUMAN AUTHORITY: disclosure release\nRECOVERY: preserve prior version / explain delta',
    fields: [
      ['Intent', 'Prepare an accurate disclosure', 'clear'],
      ['Evidence', 'Fees, terms, and version history', 'clear'],
      ['Authority', 'Draft and flag; no final release', 'hold'],
      ['Exception', 'Material fee or term change', 'stop'],
      ['Recovery', 'Explain delta and restore context', 'clear']
    ]
  },
  borrower: {
    label: 'Borrower inquiry',
    decision: 'Clarify before answering',
    summary: 'A conversational agent should distinguish a general status request from advice, dispute, or distress and make escalation frictionless rather than bluffing through ambiguity.',
    receipt: 'STATE: REQUEST CLARIFICATION\nSCOPE: status and education\nHUMAN AUTHORITY: advice, dispute, hardship\nRECOVERY: confirm intent / warm transfer with transcript',
    fields: [
      ['Intent', 'Understand the borrower request', 'hold'],
      ['Evidence', 'Authenticated account context', 'clear'],
      ['Authority', 'Status and education only', 'clear'],
      ['Exception', 'Advice, dispute, or hardship', 'stop'],
      ['Recovery', 'Clarify or warm-transfer context', 'clear']
    ]
  }
};

function renderScenario(key) {
  const data = scenarios[key];
  if (!data) return;
  document.querySelectorAll('.scenario-button').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.scenario === key));
  });
  const title = document.querySelector('[data-decision-title]');
  const summary = document.querySelector('[data-decision-summary]');
  const receipt = document.querySelector('[data-receipt]');
  const badge = document.querySelector('[data-decision-badge]');
  if (title) title.textContent = data.decision;
  if (summary) summary.textContent = data.summary;
  if (receipt) receipt.textContent = data.receipt;
  if (badge) badge.textContent = data.label;
  const container = document.querySelector('[data-review-fields]');
  if (container) {
    container.innerHTML = data.fields.map(([field, value, status]) => `
      <div class="review-line">
        <span class="field">${field}</span>
        <span class="value">${value}</span>
        <span class="status ${status}">${status === 'clear' ? 'Clear' : status === 'hold' ? 'Bounded' : 'Encumbrance'}</span>
      </div>`).join('');
  }
}

document.querySelectorAll('.scenario-button').forEach((button) => {
  button.addEventListener('click', () => renderScenario(button.dataset.scenario));
});
const reset = document.querySelector('[data-reset]');
if (reset) reset.addEventListener('click', () => renderScenario('title'));
renderScenario('title');
