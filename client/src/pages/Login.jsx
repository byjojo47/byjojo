import { Link, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Login() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { login } = useAuth();

  const schema = useMemo(() => z.object({
    email: z.string().email(t('validEmailRequired')),
    password: z.string().min(6, t('passwordMin')),
  }), [t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values) => {
    const user = await login(values);
    navigate(user.role === 'admin' ? '/admin' : '/my-orders');
  };

  return (
    <section className="container-soft section-pad max-w-xl">
      <div className="rounded-lg border border-sand bg-white p-8">
        <h1 className="font-serif text-4xl">{t('loginTitle')}</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <label>
            <span className="label">{t('email')}</span>
            <input className="field" type="email" {...register('email')} />
            <small className="text-red-700">{errors.email?.message}</small>
          </label>

          <label>
            <span className="label">{t('password')}</span>
            <input className="field" type="password" {...register('password')} />
            <small className="text-red-700">{errors.password?.message}</small>
          </label>

          <div className="pt-3">
            <button className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? t('loggingIn') : t('login')}
            </button>
          </div>
        </form>

        <p className="mt-5 text-center text-charcoal/70">
          {t('newToByJojo')}{' '}
          <Link to="/signup" className="font-bold text-olive">
            {t('createAccount')}
          </Link>
        </p>
      </div>
    </section>
  );
}