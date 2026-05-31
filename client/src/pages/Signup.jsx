import { Link, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Signup() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { signup } = useAuth();

  const schema = useMemo(() => z.object({
    fullName: z.string().min(2, t('fullNameRequired')),
    email: z.string().email(t('validEmailRequired')),
    phone: z.string().min(8, t('phoneRequired')),
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
    await signup(values);
    navigate('/my-orders');
  };

  return (
    <section className="container-soft section-pad max-w-xl">
      <div className="rounded-lg border border-sand bg-white p-8">
        <h1 className="font-serif text-4xl">{t('signupTitle')}</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <label>
            <span className="label">{t('fullName')}</span>
            <input className="field" {...register('fullName')} />
            <small className="text-red-700">{errors.fullName?.message}</small>
          </label>

          <label>
            <span className="label">{t('email')}</span>
            <input className="field" type="email" {...register('email')} />
            <small className="text-red-700">{errors.email?.message}</small>
          </label>

          <label>
            <span className="label">{t('phone')}</span>
            <input className="field" {...register('phone')} />
            <small className="text-red-700">{errors.phone?.message}</small>
          </label>

          <label>
            <span className="label">{t('password')}</span>
            <input className="field" type="password" {...register('password')} />
            <small className="text-red-700">{errors.password?.message}</small>
          </label>

          <div className="pt-3">
            <button className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? t('creating') : t('signup')}
            </button>
          </div>
        </form>

        <p className="mt-5 text-center text-charcoal/70">
          {t('alreadyAccount')}{' '}
          <Link to="/login" className="font-bold text-olive">
            {t('login')}
          </Link>
        </p>
      </div>
    </section>
  );
}