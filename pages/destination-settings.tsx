import { useAtom } from 'jotai';
import { useState } from 'react';
import { Input, Button, useToasts } from '@geist-ui/core';
import { destinationSettingsAtom } from '../src/atoms/destination-settings-atom';

export default function DestinationSettingsPage() {
  const [settings, setSettings] = useAtom(destinationSettingsAtom);
  const [address, setAddress] = useState(settings.address);
  const [privateKey, setPrivateKey] = useState(settings.privateKey);
  const { setToast } = useToasts();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings({ address, privateKey });
    setToast({ text: 'Destination settings updated!', type: 'success' });
  };

  return (
    <div style={{ maxWidth: 480, margin: '40px auto' }}>
      <h2>Destination Settings</h2>
      <form onSubmit={handleSubmit}>
        <Input
          width="100%"
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="Destination Address"
          required
          style={{ marginBottom: 16 }}
        />
        <Input.Password
          width="100%"
          value={privateKey}
          onChange={e => setPrivateKey(e.target.value)}
          placeholder="Destination Private Key"
          required
          style={{ marginBottom: 16 }}
        />
        <Button type="success" htmlType="submit" auto>
          Save Settings
        </Button>
      </form>
    </div>
  );
}