import { Alert, Button, Card, Checkbox, Group, Select, SimpleGrid, Stack, Text, TextInput, Textarea, Title } from '@mantine/core';
import { useState } from 'react';
import {
  invitationService,
  type BirthOrder,
  type ParentDto,
  type PersonDto,
} from '../../../services/invitation.service';
import { saveErrorMessage } from '../invitationHelpers';
import { clean, type SectionProps } from './shared';

const BIRTH_ORDER_OPTIONS = [
  { value: 'eldest', label: 'Con đầu' },
  { value: 'middle', label: 'Con giữa' },
  { value: 'youngest', label: 'Con út' },
];

const emptyParent = (): ParentDto => ({ full_name: null, is_deceased: false });

// Chuẩn hóa để so sánh thay đổi và gửi lên server
function normalizePerson(p: PersonDto): PersonDto {
  const parent = (x?: ParentDto | null): ParentDto | null =>
    x && (clean(x.full_name) || x.is_deceased) ? { full_name: clean(x.full_name), is_deceased: !!x.is_deceased } : null;

  return {
    full_name: clean(p.full_name),
    display_name: clean(p.display_name),
    birth_order: p.birth_order ?? null,
    bio: clean(p.bio),
    family_address: clean(p.family_address),
    father: parent(p.father),
    mother: parent(p.mother),
  };
}

function PersonFields({ title, value, onChange }: { title: string; value: PersonDto; onChange: (v: PersonDto) => void }) {
  const set = (patch: Partial<PersonDto>) => onChange({ ...value, ...patch });

  const setParent = (key: 'father' | 'mother', patch: Partial<ParentDto>) => {
    const next = { ...(value[key] ?? emptyParent()), ...patch };
    set(key === 'father' ? { father: next } : { mother: next });
  };

  return (
    <Card withBorder radius="md" padding="lg">
      <Stack gap="sm">
        <Title order={4}>{title}</Title>

        <TextInput label="Họ và tên" maxLength={100} value={value.full_name ?? ''} onChange={(e) => set({ full_name: e.currentTarget.value })} />
        <TextInput
          label="Tên hiển thị trên thiệp"
          description="Để trống sẽ dùng họ và tên"
          maxLength={40}
          value={value.display_name ?? ''}
          onChange={(e) => set({ display_name: e.currentTarget.value })}
        />
        <Select
          label="Là con thứ mấy"
          data={BIRTH_ORDER_OPTIONS}
          value={value.birth_order ?? null}
          onChange={(v) => set({ birth_order: (v as BirthOrder | null) ?? null })}
          clearable
        />
        <Textarea
          label="Giới thiệu"
          maxLength={500}
          autosize
          minRows={2}
          value={value.bio ?? ''}
          onChange={(e) => set({ bio: e.currentTarget.value })}
        />
        <TextInput label="Địa chỉ gia đình" maxLength={300} value={value.family_address ?? ''} onChange={(e) => set({ family_address: e.currentTarget.value })} />

        <Text fz="sm" fw={600} mt="xs">Cha mẹ</Text>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Stack gap={4}>
            <TextInput label="Họ tên cha" maxLength={100} value={value.father?.full_name ?? ''} onChange={(e) => setParent('father', { full_name: e.currentTarget.value })} />
            <Checkbox label='Đánh dấu "Cố"' checked={!!value.father?.is_deceased} onChange={(e) => setParent('father', { is_deceased: e.currentTarget.checked })} />
          </Stack>
          <Stack gap={4}>
            <TextInput label="Họ tên mẹ" maxLength={100} value={value.mother?.full_name ?? ''} onChange={(e) => setParent('mother', { full_name: e.currentTarget.value })} />
            <Checkbox label='Đánh dấu "Cố"' checked={!!value.mother?.is_deceased} onChange={(e) => setParent('mother', { is_deceased: e.currentTarget.checked })} />
          </Stack>
        </SimpleGrid>
      </Stack>
    </Card>
  );
}

export function CoupleSection({ invitation, etag, onChanged }: SectionProps) {
  const saved = invitation.content.couple ?? {};
  const [groom, setGroom] = useState<PersonDto>(saved.groom ?? {});
  const [bride, setBride] = useState<PersonDto>(saved.bride ?? {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const current = { groom: normalizePerson(groom), bride: normalizePerson(bride) };
  const savedNorm = { groom: normalizePerson(saved.groom ?? {}), bride: normalizePerson(saved.bride ?? {}) };
  const dirty = JSON.stringify(current) !== JSON.stringify(savedNorm);

  const save = async () => {
    setSaving(true);
    setError(null);
    setDone(false);
    try {
      await invitationService.update(invitation.id, { content: { couple: current } }, etag);
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
      <Title order={3}>Cô dâu và chú rể</Title>
      {error && <Alert color="red">{error}</Alert>}
      {done && !dirty && <Alert color="green">Đã lưu.</Alert>}

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <PersonFields title="Chú rể" value={groom} onChange={setGroom} />
        <PersonFields title="Cô dâu" value={bride} onChange={setBride} />
      </SimpleGrid>

      <Group justify="flex-end">
        <Button color="pink" radius="md" loading={saving} disabled={!dirty || saving} onClick={() => void save()}>
          Lưu thông tin cô dâu chú rể
        </Button>
      </Group>
    </Stack>
  );
}