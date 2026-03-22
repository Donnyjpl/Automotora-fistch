import { useState } from "react";

const ArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 5l-7 7 7 7" />
  </svg>
);

const MailIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF5C00" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 7l10 7 10-7" />
  </svg>
);

const CheckIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FF5C00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12l3 3 5-5" />
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .root {
    min-height: 100vh; display: flex;
    background: #fff; font-family: 'DM Sans', sans-serif; overflow: hidden;
  }
  .left {
    width: 52%; background: #111;
    display: flex; flex-direction: column; justify-content: space-between;
    padding: 48px; position: relative; overflow: hidden;
  }
  .left-deco {
    position: absolute; bottom: -80px; left: -80px;
    width: 420px; height: 420px; border-radius: 50%;
    background: #FF5C00; opacity: 0.12; pointer-events: none;
  }
  .left-deco2 {
    position: absolute; top: 60px; right: -60px;
    width: 200px; height: 200px; border-radius: 50%;
    border: 40px solid rgba(255,92,0,0.15); pointer-events: none;
  }
  .brand { display: flex; align-items: center; gap: 10px; cursor: pointer; }
  .brand-dot { width: 10px; height: 10px; border-radius: 50%; background: #FF5C00; }
  .brand-name { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 0.12em; color: #fff; }
  .left-body { position: relative; z-index: 1; }
  .left-tag {
    display: inline-block; background: rgba(255,92,0,0.18); color: #FF5C00;
    font-size: 10px; font-weight: 500; letter-spacing: 0.25em; text-transform: uppercase;
    padding: 6px 14px; border-radius: 2px; margin-bottom: 28px;
  }
  .left-headline {
    font-family: 'Bebas Neue', sans-serif; font-size: clamp(52px, 6.5vw, 80px);
    line-height: 0.92; color: #fff; letter-spacing: 0.01em; margin-bottom: 24px;
  }
  .left-headline span { color: #FF5C00; display: block; }
  .left-sub { color: rgba(255,255,255,0.38); font-size: 13px; font-weight: 300; line-height: 1.7; max-width: 280px; }
  .left-footer { color: rgba(255,255,255,0.2); font-size: 11px; letter-spacing: 0.05em; }

  .right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px 32px; }

  .form-box { width: 100%; max-width: 360px; animation: slideIn 0.45s ease both; }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .back-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: none; border: none; cursor: pointer; color: #aaa;
    font-family: 'DM Sans', sans-serif; font-size: 12px; padding: 0;
    margin-bottom: 36px; transition: color 0.2s;
  }
  .back-btn:hover { color: #FF5C00; }

  .form-icon {
    width: 56px; height: 56px; background: rgba(255,92,0,0.08);
    border-radius: 4px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;
  }
  .form-title { font-family: 'Bebas Neue', sans-serif; font-size: 38px; color: #111; letter-spacing: 0.04em; margin-bottom: 8px; }
  .form-subtitle { font-size: 13px; color: #999; font-weight: 300; line-height: 1.6; margin-bottom: 36px; }

  .field { margin-bottom: 20px; }
  .field label {
    display: block; font-size: 10px; font-weight: 500;
    letter-spacing: 0.18em; text-transform: uppercase; color: #aaa; margin-bottom: 8px;
  }
  .input-wrap { position: relative; }
  .field input {
    width: 100%; border: 1.5px solid #e8e8e8; background: #fafafa;
    color: #111; font-family: 'DM Sans', sans-serif; font-size: 14px;
    padding: 13px 16px; outline: none; border-radius: 3px;
    transition: border-color 0.2s, background 0.2s; -webkit-appearance: none;
  }
  .field input::placeholder { color: #ccc; }
  .field input:focus { border-color: #FF5C00; background: #fff; }
  .field input.with-btn { padding-right: 48px; }
  .hint { margin-top: 8px; font-size: 11px; color: #bbb; font-weight: 300; }

  .eye-btn {
    position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; color: #bbb;
    display: flex; align-items: center; padding: 4px; transition: color 0.2s; line-height: 0;
  }
  .eye-btn:hover { color: #FF5C00; }

  .submit-btn {
    width: 100%; margin-top: 28px; padding: 15px; background: #FF5C00;
    border: none; color: #fff; font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase;
    cursor: pointer; border-radius: 3px; transition: background 0.2s, transform 0.15s;
    display: flex; align-items: center; justify-content: center; gap: 10px;
  }
  .submit-btn:hover:not(:disabled) { background: #e64f00; transform: translateY(-1px); }
  .submit-btn:active:not(:disabled) { transform: translateY(0); }
  .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  .spinner {
    width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3);
    border-top-color: #fff; border-radius: 50%; animation: spin 0.65s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .form-bottom { margin-top: 24px; text-align: center; font-size: 12px; color: #bbb; }
  .form-bottom button {
    background: none; border: none; cursor: pointer;
    color: #FF5C00; font-weight: 500; font-size: 12px; font-family: 'DM Sans', sans-serif; padding: 0;
  }

  /* SUCCESS */
  .success-box { width: 100%; max-width: 360px; animation: slideIn 0.45s ease both; text-align: center; }
  .success-icon {
    width: 72px; height: 72px; background: rgba(255,92,0,0.08);
    border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 28px;
  }
  .success-title { font-family: 'Bebas Neue', sans-serif; font-size: 38px; color: #111; letter-spacing: 0.04em; margin-bottom: 12px; }
  .success-text { font-size: 13px; color: #999; font-weight: 300; line-height: 1.7; margin-bottom: 8px; }
  .success-email { font-size: 13px; color: #111; font-weight: 500; margin-bottom: 36px; }
  .divider-line { height: 1px; background: #f0f0f0; margin: 32px 0; }
  .resend-row { display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #bbb; }
  .resend-btn {
    background: none; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 12px; color: #FF5C00; font-weight: 500; padding: 0;
  }
  .back-login-btn {
    width: 100%; margin-top: 16px; padding: 14px; background: #fff;
    border: 1.5px solid #e8e8e8; color: #111; font-family: 'DM Sans', sans-serif;
    font-size: 11px; font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase;
    cursor: pointer; border-radius: 3px; transition: border-color 0.2s;
  }
  .back-login-btn:hover { border-color: #111; }

  @media (max-width: 640px) {
    .root { flex-direction: column; }
    .left { width: 100%; padding: 36px 28px 44px; }
    .left-headline { font-size: 54px; }
    .right { padding: 40px 24px; }
  }
`;

// ─── PAGES ───────────────────────────────────────────────────────────────────

const LeftPanel = ({ tag, headline, sub, onBrand }) => (
  <div className="left">
    <div className="left-deco" />
    <div className="left-deco2" />
    <div className="brand" onClick={onBrand}>
      <div className="brand-dot" />
      <span className="brand-name">Marca</span>
    </div>
    <div className="left-body">
      <span className="left-tag">{tag}</span>
      <h1 className="left-headline" dangerouslySetInnerHTML={{ __html: headline }} />
      <p className="left-sub">{sub}</p>
    </div>
    <div className="left-footer">© 2026 Marca · Todos los derechos reservados</div>
  </div>
);

const LoginForm = ({ onForgot }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setMsg({ ok: false, text: "Usuario o contraseña incorrecta" });
  };

  return (
    <div className="form-box">
      <h2 className="form-title">Iniciar sesión</h2>
      <p className="form-subtitle">Ingresa tus credenciales para continuar</p>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Usuario</label>
          <div className="input-wrap">
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="tu_usuario" />
          </div>
        </div>
        <div className="field">
          <label>Contraseña</label>
          <div className="input-wrap">
            <input
              className="with-btn"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button type="button" className="eye-btn" onClick={() => setShowPassword(v => !v)}>
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>
        {msg && (
          <p style={{ fontSize: 12, color: msg.ok ? "#2e7d32" : "#c62828", marginTop: 4 }}>{msg.text}</p>
        )}
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading && <span className="spinner" />}
          {loading ? "Verificando..." : "Ingresar"}
        </button>
      </form>
      <p className="form-bottom">
        ¿Olvidaste tu contraseña?{" "}
        <button onClick={onForgot}>Recupérala</button>
      </p>
    </div>
  );
};

const ForgotForm = ({ onBack }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setLoading(false);
    setSent(true);
  };

  if (sent) return (
    <div className="success-box">
      <div className="success-icon"><CheckIcon /></div>
      <h2 className="success-title">¡Enviado!</h2>
      <p className="success-text">Revisá tu bandeja de entrada en</p>
      <p className="success-email">{email}</p>
      <div className="divider-line" />
      <div className="resend-row">
        <span>¿No llegó el correo?</span>
        <button className="resend-btn" onClick={() => setSent(false)}>Reenviar</button>
      </div>
      <button className="back-login-btn" onClick={onBack}>Volver al login</button>
    </div>
  );

  return (
    <div className="form-box">
      <button className="back-btn" onClick={onBack}><ArrowLeft /> Volver al login</button>
      <div className="form-icon"><MailIcon /></div>
      <h2 className="form-title">Restablecer</h2>
      <p className="form-subtitle">Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.</p>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Correo electrónico</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@ejemplo.com" required />
          <p className="hint">El enlace es válido por 30 minutos.</p>
        </div>
        <button type="submit" className="submit-btn" disabled={loading || !email}>
          {loading && <span className="spinner" />}
          {loading ? "Enviando..." : "Enviar enlace"}
        </button>
      </form>
    </div>
  );
};

// ─── APP ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("login");

  const panels = {
    login: {
      tag: "Plataforma",
      headline: "Accede<br/>a tu<br/><span>cuenta.</span>",
      sub: "Gestiona todo desde un solo lugar. Rápido, seguro y sin complicaciones.",
    },
    forgot: {
      tag: "Recuperación",
      headline: "¿Olvidaste<br/>tu<br/><span>clave?</span>",
      sub: "Te enviamos un enlace a tu correo para restablecer tu contraseña en segundos.",
    },
  };

  const p = panels[page];

  return (
    <>
      <style>{STYLES}</style>
      <div className="root">
        <LeftPanel tag={p.tag} headline={p.headline} sub={p.sub} onBrand={() => setPage("login")} />
        <div className="right">
          {page === "login"
            ? <LoginForm onForgot={() => setPage("forgot")} />
            : <ForgotForm onBack={() => setPage("login")} />
          }
        </div>
      </div>
    </>
  );
}