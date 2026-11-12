'use client';

import { forwardRef, useState } from 'react';
import { CircleAlert, Eye, EyeOff } from 'lucide-react';
import s from './auth.module.css';

// Password input with a show/hide toggle. Extra props go to the <input>.
const PasswordField = forwardRef(function PasswordField({ id, label, labelAside, hint, error, hintId, errorId, extraDescribedBy, ...inputProps }, ref) {
  const [shown, setShown] = useState(false);
  const describedBy = [hint ? hintId : null, extraDescribedBy, error ? errorId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className="field">
      <div className={s.labelRow}>
        <label className="label" htmlFor={id}>{label}</label>
        {labelAside}
      </div>
      <div className={s.pwWrap}>
        <input
          ref={ref}
          id={id}
          type={shown ? 'text' : 'password'}
          className="input"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...inputProps}
        />
        <button
          type="button"
          className={s.pwToggle}
          aria-pressed={shown}
          aria-label="Show password"
          aria-controls={id}
          onClick={() => setShown((v) => !v)}
        >
          {shown ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </button>
      </div>
      {hint && <p id={hintId} className="hint">{hint}</p>}
      {error && <p id={errorId} className="field-error" role="alert"><CircleAlert aria-hidden="true" />{error}</p>}
    </div>
  );
});

export default PasswordField;
