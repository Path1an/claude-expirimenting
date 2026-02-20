import { db } from '@/db';
import { siteSettings } from '@/db/schema';
import SettingsForm from './SettingsForm';

export default async function SettingsPage() {
  const settings = db.select().from(siteSettings).get() ?? {};
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">Site Settings</h1>
        <p className="text-gray-400 dark:text-zinc-500 text-sm mt-1">Configure your site and headless API settings</p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
