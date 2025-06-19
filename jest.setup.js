// Mock Prism
global.Prism = {
  highlightElement: jest.fn(),
  languages: {
    javascript: {},
    python: {},
    java: {},
    cpp: {},
    csharp: {},
    php: {},
    ruby: {},
    swift: {},
    go: {},
    rust: {},
    typescript: {},
    html: {},
    css: {},
    sql: {},
    bash: {},
    shell: {},
    json: {},
    yaml: {},
    markdown: {},
    xml: {},
    none: {}
  }
};

// Mock chrome API
global.chrome = {
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  }
};

// Mock fetch
global.fetch = jest.fn();

// Mock window.location
delete window.location;
window.location = {
  href: 'http://localhost',
  assign: jest.fn(),
  replace: jest.fn()
}; 