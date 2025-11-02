import {
  sanitizeHtml,
  sanitizeText,
  sanitizeUrl,
  sanitizeFilename,
  sanitizeEmail,
  sanitizePhone,
  sanitizeObject,
  escapeHtmlAttribute,
  sanitizeJson,
  sanitizeQuery,
  isSafeValue,
} from '../sanitize';

describe('XSS Prevention - sanitizeHtml', () => {
  it('should remove script tags', () => {
    const malicious = '<script>alert("XSS")</script>Hello';
    const result = sanitizeHtml(malicious, true);
    expect(result).not.toContain('<script>');
    expect(result).toBe('Hello');
  });

  it('should remove inline javascript event handlers', () => {
    const malicious = '<img src=x onerror=alert(1)>';
    const result = sanitizeHtml(malicious, true);
    expect(result).not.toContain('onerror');
    expect(result).toBe('');
  });

  it('should remove iframe tags', () => {
    const malicious = '<iframe src="evil.com"></iframe>';
    const result = sanitizeHtml(malicious, true);
    expect(result).not.toContain('iframe');
  });

  it('should handle non-string input', () => {
    expect(sanitizeHtml(null as any)).toBe('');
    expect(sanitizeHtml(undefined as any)).toBe('');
    expect(sanitizeHtml(123 as any)).toBe('');
  });

  it('should allow safe HTML tags in non-strict mode', () => {
    const safe = '<p>Hello <b>World</b></p>';
    const result = sanitizeHtml(safe, false);
    expect(result).toContain('<b>');
    expect(result).toContain('</b>');
  });

  it('should strip all HTML in strict mode', () => {
    const html = '<p>Hello <b>World</b></p>';
    const result = sanitizeHtml(html, true);
    expect(result).toBe('Hello World');
  });
});

describe('XSS Prevention - sanitizeText', () => {
  it('should remove all HTML tags', () => {
    const input = '<div>Hello</div><script>alert(1)</script>';
    const result = sanitizeText(input);
    expect(result).toBe('Hello');
  });

  it('should handle XSS in attributes', () => {
    const input = '<a href="javascript:alert(1)">Click</a>';
    const result = sanitizeText(input);
    expect(result).toBe('Click');
  });

  it('should handle encoded XSS', () => {
    const input = '&lt;script&gt;alert(1)&lt;/script&gt;Text';
    const result = sanitizeText(input);
    expect(result).not.toContain('<script>');
  });
});

describe('XSS Prevention - sanitizeUrl', () => {
  it('should block javascript: protocol', () => {
    const malicious = 'javascript:alert(1)';
    const result = sanitizeUrl(malicious);
    expect(result).toBe('');
  });

  it('should block data: protocol', () => {
    const malicious = 'data:text/html,<script>alert(1)</script>';
    const result = sanitizeUrl(malicious);
    expect(result).toBe('');
  });

  it('should block vbscript: protocol', () => {
    const malicious = 'vbscript:msgbox("XSS")';
    const result = sanitizeUrl(malicious);
    expect(result).toBe('');
  });

  it('should allow https URLs', () => {
    const safe = 'https://example.com/path';
    const result = sanitizeUrl(safe);
    expect(result).toBe(safe);
  });

  it('should allow http URLs', () => {
    const safe = 'http://example.com';
    const result = sanitizeUrl(safe);
    expect(result).toBe(safe);
  });

  it('should allow relative URLs', () => {
    expect(sanitizeUrl('/path/to/page')).toBe('/path/to/page');
    expect(sanitizeUrl('./relative')).toBe('./relative');
    expect(sanitizeUrl('../parent')).toBe('../parent');
  });

  it('should handle case-insensitive protocol detection', () => {
    expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBe('');
    expect(sanitizeUrl('JaVaScRiPt:alert(1)')).toBe('');
  });
});

describe('XSS Prevention - sanitizeFilename', () => {
  it('should remove path traversal attempts', () => {
    const malicious = '../../../etc/passwd';
    const result = sanitizeFilename(malicious);
    expect(result).not.toContain('..');
    expect(result).toBe('etcpasswd');
  });

  it('should remove dangerous characters', () => {
    const malicious = 'file<script>.txt';
    const result = sanitizeFilename(malicious);
    expect(result).toBe('file.txt');
  });

  it('should limit filename length', () => {
    const long = 'a'.repeat(300);
    const result = sanitizeFilename(long);
    expect(result.length).toBeLessThanOrEqual(255);
  });

  it('should remove leading dots', () => {
    expect(sanitizeFilename('...secret.txt')).toBe('secret.txt');
  });

  it('should remove trailing dots', () => {
    expect(sanitizeFilename('file.txt...')).toBe('file.txt');
  });
});

describe('XSS Prevention - sanitizeEmail', () => {
  it('should allow valid email', () => {
    const valid = 'user@example.com';
    const result = sanitizeEmail(valid);
    expect(result).toBe(valid);
  });

  it('should block XSS in email', () => {
    const malicious = '"><script>alert(1)</script>@example.com';
    const result = sanitizeEmail(malicious);
    expect(result).toBe('');
  });

  it('should block invalid email format', () => {
    expect(sanitizeEmail('not-an-email')).toBe('');
    expect(sanitizeEmail('missing@domain')).toBe('');
  });

  it('should normalize email to lowercase', () => {
    const result = sanitizeEmail('USER@EXAMPLE.COM');
    expect(result).toBe('user@example.com');
  });
});

describe('XSS Prevention - sanitizePhone', () => {
  it('should allow valid phone number', () => {
    const valid = '+1 (555) 123-4567';
    const result = sanitizePhone(valid);
    expect(result).toBe(valid);
  });

  it('should remove XSS attempts', () => {
    const malicious = '+1<script>alert(1)</script>5551234567';
    const result = sanitizePhone(malicious);
    expect(result).toBe('+15551234567');
  });

  it('should remove letters', () => {
    const input = '+1 abc 555 xyz 1234';
    const result = sanitizePhone(input);
    expect(result).toBe('+1  555  1234');
  });
});

describe('XSS Prevention - sanitizeObject', () => {
  it('should sanitize all string values', () => {
    const malicious = {
      name: '<script>alert(1)</script>John',
      email: 'john@example.com',
      bio: '<img src=x onerror=alert(1)>Developer',
    };

    const result = sanitizeObject(malicious);
    expect(result.name).toBe('John');
    expect(result.bio).toBe('Developer');
  });

  it('should handle nested objects', () => {
    const nested = {
      user: {
        profile: {
          bio: '<script>alert(1)</script>Text',
        },
      },
    };

    const result = sanitizeObject(nested);
    expect(result.user.profile.bio).toBe('Text');
  });

  it('should handle arrays', () => {
    const withArray = {
      tags: ['<script>alert(1)</script>tag1', 'tag2'],
    };

    const result = sanitizeObject(withArray);
    expect(result.tags[0]).toBe('tag1');
    expect(result.tags[1]).toBe('tag2');
  });

  it('should preserve non-string values', () => {
    const mixed = {
      name: '<script>alert(1)</script>John',
      age: 25,
      active: true,
      data: null,
    };

    const result = sanitizeObject(mixed);
    expect(result.age).toBe(25);
    expect(result.active).toBe(true);
    expect(result.data).toBeNull();
  });
});

describe('XSS Prevention - escapeHtmlAttribute', () => {
  it('should escape double quotes', () => {
    const input = '">alert(1)<"';
    const result = escapeHtmlAttribute(input);
    expect(result).toContain('&quot;');
  });

  it('should escape angle brackets', () => {
    const input = '<script>';
    const result = escapeHtmlAttribute(input);
    expect(result).toBe('&lt;script&gt;');
  });

  it('should escape ampersands', () => {
    const input = 'Tom & Jerry';
    const result = escapeHtmlAttribute(input);
    expect(result).toContain('&amp;');
  });

  it('should escape single quotes', () => {
    const input = "It's a test";
    const result = escapeHtmlAttribute(input);
    expect(result).toContain('&#x27;');
  });
});

describe('XSS Prevention - sanitizeJson', () => {
  it('should parse and sanitize valid JSON', () => {
    const jsonString = '{"name":"<script>alert(1)</script>John"}';
    const result = sanitizeJson(jsonString);
    expect(result?.name).toBe('John');
  });

  it('should return null for invalid JSON', () => {
    const invalid = 'not a json';
    const result = sanitizeJson(invalid);
    expect(result).toBeNull();
  });

  it('should sanitize nested JSON', () => {
    const jsonString = '{"user":{"bio":"<img src=x onerror=alert(1)>Text"}}';
    const result = sanitizeJson(jsonString);
    expect(result?.user?.bio).toBe('Text');
  });
});

describe('XSS Prevention - sanitizeQuery', () => {
  it('should remove SQL injection attempts', () => {
    const malicious = "'; DROP TABLE users; --";
    const result = sanitizeQuery(malicious);
    expect(result).not.toContain('DROP');
    expect(result).not.toContain(';');
  });

  it('should remove SQL keywords', () => {
    const malicious = 'SELECT * FROM users';
    const result = sanitizeQuery(malicious);
    expect(result).not.toContain('SELECT');
  });

  it('should allow safe queries', () => {
    const safe = 'search term';
    const result = sanitizeQuery(safe);
    expect(result).toBe(safe);
  });
});

describe('XSS Prevention - isSafeValue', () => {
  it('should return true for safe strings', () => {
    expect(isSafeValue('Hello World')).toBe(true);
  });

  it('should return false for strings with HTML', () => {
    expect(isSafeValue('<script>alert(1)</script>')).toBe(false);
  });

  it('should return true for numbers', () => {
    expect(isSafeValue(123)).toBe(true);
  });

  it('should return true for booleans', () => {
    expect(isSafeValue(true)).toBe(true);
    expect(isSafeValue(false)).toBe(true);
  });

  it('should return true for null/undefined', () => {
    expect(isSafeValue(null)).toBe(true);
    expect(isSafeValue(undefined)).toBe(true);
  });

  it('should return false for objects', () => {
    expect(isSafeValue({ key: 'value' })).toBe(false);
  });
});

describe('XSS Prevention - Real World Attack Vectors', () => {
  it('should block img src XSS', () => {
    const attack = '<img src=x onerror="alert(\'XSS\')">';
    const result = sanitizeHtml(attack, true);
    expect(result).not.toContain('onerror');
  });

  it('should block svg XSS', () => {
    const attack = '<svg onload=alert(1)>';
    const result = sanitizeHtml(attack, true);
    expect(result).not.toContain('onload');
  });

  it('should block style XSS', () => {
    const attack = '<style>body{background:url("javascript:alert(1)")}</style>';
    const result = sanitizeHtml(attack, true);
    expect(result).not.toContain('javascript');
  });

  it('should block link XSS', () => {
    const attack = '<link rel="import" href="data:text/html,<script>alert(1)</script>">';
    const result = sanitizeHtml(attack, true);
    expect(result).toBe('');
  });

  it('should block meta refresh XSS', () => {
    const attack = '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">';
    const result = sanitizeHtml(attack, true);
    expect(result).toBe('');
  });

  it('should block base href XSS', () => {
    const attack = '<base href="javascript:alert(1)//">';
    const result = sanitizeHtml(attack, true);
    expect(result).toBe('');
  });

  it('should block form action XSS', () => {
    const attack = '<form action="javascript:alert(1)"><input type="submit"></form>';
    const result = sanitizeHtml(attack, true);
    expect(result).toBe('');
  });

  it('should block object/embed XSS', () => {
    const attack = '<object data="javascript:alert(1)">';
    const result = sanitizeHtml(attack, true);
    expect(result).toBe('');
  });
});
