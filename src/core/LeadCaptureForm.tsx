import { useCallback, useState, type FormEvent } from 'react';

export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  specJson: string;
}

interface LeadCaptureFormProps {
  specJson: string;
  onSubmit?: (data: LeadFormData) => void;
}

export const LeadCaptureForm = ({
  specJson,
  onSubmit,
}: LeadCaptureFormProps): JSX.Element => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      const data: LeadFormData = { name, email, phone, message, specJson };
      if (onSubmit) {
        onSubmit(data);
      }
      setSubmitted(true);
    },
    [name, email, phone, message, specJson, onSubmit],
  );

  if (submitted) {
    return (
      <div className="lead-success" role="status" aria-live="polite">
        <strong>Thank you!</strong>
        <p className="hint">
          Your quote request has been submitted. We will follow up within 1 business day.
        </p>
        <button
          type="button"
          className="oc-icon-btn"
          onClick={() => setSubmitted(false)}
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form
      className="lead-form"
      onSubmit={handleSubmit}
      aria-label="Request a quote"
    >
      <div className="lead-field">
        <label htmlFor="lead-name">Name *</label>
        <input
          id="lead-name"
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your full name"
          autoComplete="name"
        />
      </div>
      <div className="lead-field">
        <label htmlFor="lead-email">Email *</label>
        <input
          id="lead-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
        />
      </div>
      <div className="lead-field">
        <label htmlFor="lead-phone">Phone</label>
        <input
          id="lead-phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Optional"
          autoComplete="tel"
        />
      </div>
      <div className="lead-field">
        <label htmlFor="lead-message">Notes</label>
        <textarea
          id="lead-message"
          rows={3}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Tell us about your project (optional)"
        />
      </div>
      <button type="submit" className="oc-icon-btn primary lead-submit">
        Get a Quote
      </button>
      <p className="lead-privacy">
        Your configuration is automatically attached. We never share your data.
      </p>
    </form>
  );
};
