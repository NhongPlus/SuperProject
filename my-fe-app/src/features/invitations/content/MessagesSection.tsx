import { Alert, Button, Group, Stack, Textarea, Title } from '@mantine/core';
import { useState } from 'react';
import { invitationService } from '../../../services/invitation.service';
import { saveErrorMessage } from '../invitationHelpers';
import { clean, type SectionProps } from './shared';

export function MessagesSection({ invitation, etag, onChanged }: SectionProps) {
  const saved = invitation.content.messages ?? {};
  const [greeting, setGreeting] = useState(saved.greeting ?? '');
  const [message, setMessage] = useState(saved.invitation_message ?? '');
  const [notes, setNotes] = useState(saved.guest_notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const current = {
    greeting: clean(greeting),
    invitation_message: clean(message),
    guest_notes: clean(notes),
  };
  const savedNorm = {
    greeting: clean(saved.greeting),
    invitation_message: clean(saved.invitation_message),
    guest_notes: clean(saved.guest_notes),
  };
  const dirty = JSON.stringify(current) !== JSON.stringify(savedNorm);

  const save = async () => {
    setSaving(true);
    setError(null);
    setDone(false);
    try {
      await invitationService.update(invitation.id, { content: { messages: current } }, etag);
      setDone(true);
      await onChanged();
    } catch (err) {
      setError(saveErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack gap="md">
      <Title order={3}>Lời chào và lời mời</Title>
      {error && <Alert color="red">{error}</Alert>}
      {done && !dirty && <Alert color="green">Đã lưu.</Alert>}

      <Textarea label="Lời chào" maxLength={1000} autosize minRows={2} value={greeting} onChange={(e) => setGreeting(e.currentTarget.value)} />
      <Textarea label="Lời mời" maxLength={500} autosize minRows={2} value={message} onChange={(e) => setMessage(e.currentTarget.value)} />
      <Textarea label="Ghi chú cho khách" maxLength={1000} autosize minRows={2} value={notes} onChange={(e) => setNotes(e.currentTarget.value)} />

      <Group justify="flex-end">
        <Button color="pink" radius="md" loading={saving} disabled={!dirty || saving} onClick={() => void save()}>
          Lưu lời chào và lời mời
        </Button>
      </Group>
    </Stack>
  );
}