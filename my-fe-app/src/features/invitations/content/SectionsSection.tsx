import { Alert, Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import { useState } from 'react';
import { useTemplate } from '../../templates/useTemplates';
import { SECTION_LABELS } from '../../templates/templateHelpers';
import { invitationService, type InvitationDto } from '../../../services/invitation.service';
import type { SectionKey } from '../../../services/template.service';
import { saveErrorMessage } from '../invitationHelpers';
import type { SectionProps } from './shared';

export function SectionsSection({ invitation, etag, onChanged }: SectionProps) {
  const { data: template, loading } = useTemplate(invitation.template_key);
  const saved: SectionKey[] = invitation.content.appearance?.sections ?? [];
  const [chosen, setChosen] = useState<SectionKey[]>(saved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const dirty = JSON.stringify(chosen) !== JSON.stringify(saved);
  const allowed: SectionKey[] = template?.manifest.sections ?? [];
  const hidden = allowed.filter((s) => !chosen.includes(s));

  const show = (s: SectionKey) => {
    setDone(false);
    setChosen((xs) => [...xs, s]);
  };
  const hide = (s: SectionKey) => {
    setDone(false);
    setChosen((xs) => xs.filter((x) => x !== s));
  };
  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= chosen.length) return;
    setDone(false);
    setChosen((xs) => {
      const next = [...xs];
      const a = next[index];
      const b = next[target];
      if (!a || !b) return xs;
      next[index] = b;
      next[target] = a;
      return next;
    });
  };

  const save = async (next: InvitationDto['content']['appearance']['sections']) => {
    setSaving(true);
    setError(null);
    setDone(false);
    try {
      // Chỉ gửi sections; các trường còn lại của appearance (palette, font, nền) được giữ nguyên
      await invitationService.update(invitation.id, { content: { appearance: { sections: next } } }, etag);
      setDone(true);
      await onChanged();
    } catch (err) {
      setError(saveErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading && !template) return <Text c="dimmed" fz="sm">Đang tải danh sách phần của mẫu...</Text>;

  return (
    <Stack gap="md">
      <Title order={3}>Các phần của thiệp</Title>
      {error && <Alert color="red">{error}</Alert>}
      {done && !dirty && <Alert color="green">Đã lưu.</Alert>}

      <Card withBorder radius="md" padding="md">
        <Stack gap="sm">
          <Text fw={600}>Đang hiển thị (theo thứ tự)</Text>
          {chosen.length === 0 && <Text c="dimmed" fz="sm">Chưa có phần nào được hiển thị.</Text>}
          {chosen.map((s, i) => (
            <Group key={s} justify="space-between">
              <Text>{SECTION_LABELS[s]}</Text>
              <Group gap="xs">
                <Button size="xs" variant="subtle" color="gray" disabled={i === 0} onClick={() => move(i, -1)}>
                  Lên
                </Button>
                <Button size="xs" variant="subtle" color="gray" disabled={i === chosen.length - 1} onClick={() => move(i, 1)}>
                  Xuống
                </Button>
                <Button size="xs" variant="subtle" color="red" onClick={() => hide(s)}>
                  Ẩn
                </Button>
              </Group>
            </Group>
          ))}
        </Stack>
      </Card>

      {hidden.length > 0 && (
        <Card withBorder radius="md" padding="md">
          <Stack gap="sm">
            <Text fw={600}>Đang ẩn</Text>
            {hidden.map((s) => (
              <Group key={s} justify="space-between">
                <Text c="dimmed">{SECTION_LABELS[s]}</Text>
                <Button size="xs" variant="light" color="pink" onClick={() => show(s)}>
                  Hiện
                </Button>
              </Group>
            ))}
          </Stack>
        </Card>
      )}

      <Group justify="flex-end">
        <Button color="pink" radius="md" loading={saving} disabled={!dirty || saving} onClick={() => void save(chosen)}>
          Lưu các phần của thiệp
        </Button>
      </Group>
    </Stack>
  );
}