import 'dotenv/config';

export class EnvConfig {
  readonly database = {
    host: this.str('DB_HOST'),
    port: this.num('DB_PORT'),
    username: this.str('DB_USERNAME'),
    password: this.str('DB_PASSWORD'),
    database: this.str('DB_DATABASE'),
  };

  private str(key: string, def?: string): string {
    const value = process.env[key] ?? def;
    if (value === undefined || value === '') {
      const msg = `CONFIG → Missing env var: ${key}`;
      console.error(msg);
      throw new Error(msg);
    }
    if (!process.env[key] && def !== undefined) {
      console.warn(`ENV ${key} missing, defaulting to "${def}"`);
    }
    return value.trim();
  }

  private strOptional(key: string): string | undefined {
    const value = process.env[key];
    return value && value.trim() !== '' ? value.trim() : undefined;
  }

  private num(key: string, def?: number): number {
    const raw = process.env[key];
    const value = raw !== undefined ? Number(raw) : def;
    if (value === undefined || Number.isNaN(value)) {
      const msg = `CONFIG → Invalid number for ${key}: ${raw}`;
      console.error(msg);
      throw new Error(msg);
    }
    if (raw === undefined && def !== undefined) {
      console.warn(`ENV ${key} missing, defaulting to ${def}`);
    }
    return value;
  }

  private bool(key: string, def = false): boolean {
    const raw = process.env[key];
    if (!raw) {
      console.warn(`ENV ${key} missing, defaulting to ${def}`);
      return def;
    }
    return ['true', '1', 'yes', 'on'].includes(raw.toLowerCase());
  }

  private list(key: string, sep = ',', def: string[] = []): string[] {
    const raw = process.env[key];
    if (!raw) {
      console.warn(`ENV ${key} missing, defaulting to ${JSON.stringify(def)}`);
      return def;
    }
    return raw
      .split(sep)
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

export const envConfig = new EnvConfig();
