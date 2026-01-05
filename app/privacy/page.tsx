const PrivacyPolicy = () => {
  return (
    <section className="max-w-5xl mx-auto sm:p-16 pb-12 !pt-[20px] px-8 min-h-[calc(100vh-80px)]">
      <div className="mt-5">
        <h2 className="sm:text-4xl text-2xl font-bold text-slate-900 dark:text-white">Privacy Policy</h2>
        <p className="mt-4 text-lg">Last Updated: January 5, 2026</p>
        <p className="mt-2 text-slate-500 dark:text-white">
          We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and how we keep it safe when you use our website.
        </p>
        <p className="mt-4 text-lg text-slate-700 dark:text-white font-semibold">What Information We Collect?</p>
        <p className="mt-2 dark:text-white">
            We only collect your email address for identity verification. Your email is used to send a One-Time Password (OTP) to ensure that only valid and real email addresses can register on our website. To complete the verification process, your email address may be temporarily stored in your browser’s local storage. This information is used only to link the OTP verification process and is automatically removed after the verification is completed.
        </p>
        <p className="mt-2 dark:text-white">
            We also use some third-party services such as:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-2">
          <li>
            <a 
              href="https://vercel.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Vercel
            </a>: We use Vercel as a server to store this website and we also use Vercel Analytics to analyze our website traffic.
          </li>
          <li>
            <a 
              href="https://neon.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Neon
            </a>: We use Neon for store user data and exam data.
          </li>
          <li>
            <a 
              href="https://resend.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Resend
            </a>: We use Resend to send OTP to users.
          </li>
          <li>
            <a 
              href="https://cloudflare.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Cloudflare
            </a>: We use Cloudflare to enhance website security and performance, including protection against malicious traffic.
          </li>
        </ul>
        <p className="mt-4 text-lg text-slate-700 dark:text-white font-semibold">How We Use Your Information?</p>
        <p className="mt-2 text-slate-500 dark:text-white">
          We do not sell or rent your personal information to third parties. We may share your information with third parties only when necessary to provide our services. This includes sharing your email address with our email service provider solely for the purpose of sending a One-Time Password (OTP) during the account verification process. We do not allow third parties to use your information for marketing or any other purposes.
        </p>
        <p className="mt-4 text-lg text-slate-700 dark:text-white font-semibold">Security</p>
        <p className="mt-2 text-slate-500 dark:text-white">
          We take reasonable steps to protect your personal information and prevent unauthorized access. While we work to keep your data safe, no online system can be completely secure.
        </p>
        <p className="mt-4 text-lg text-slate-700 dark:text-white font-semibold">Changes to This Privacy Policy</p>
        <p className="mt-2 text-slate-500 dark:text-white">
          We may occasionally update this Privacy Policy. When we do, we will update the “Last Updated” date at the top of this page.
        </p>
        <p className="mt-4 text-lg text-slate-700 dark:text-white font-semibold">Contact Us</p>
        <p className="mt-2 text-slate-500 dark:text-white">
          If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@nizaralghifary.my.id" className="underline text-blue-600 dark:text-blue-400">support@nizaralghifary.my.id</a>
        </p>
      </div>
    </section>
  );
};

export default PrivacyPolicy;