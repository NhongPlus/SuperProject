import { Alert, Button, Card, FileButton, Group, Image, NumberInput, Select, Stack, Text, TextInput, Textarea, Title } from '@mantine/core';
import { useState } from 'react';
import { useMedia } from '../useMedia';
import { invitationService, type LoveStoryItemDto } from '../../../services/invitation.service';
import { uploadMedia, type MediaDto } from '../../../services/media.service';
import { saveErrorMessage } from '../invitationHelpers';
import { getErrorMessage } from '../../../services/http';
import { clean, type SectionProps } from './shared';

// Đặc tả: tối đa 12 mục chuyện tình yêu
const MAX_ITEMS = 12;

const emptyItem = (): LoveStoryItemDto => ({ title: '', description: null, year: null, month: null, media_id: null });

// Trả về lỗi của một mục, hoặc null nếu hợp lệ
function itemProblem(item: LoveStoryItemDto): string | null {
  if (!item.title.trim()) return 'Nhập tiêu đề';
  const year = item.year ?? null;
  const month = item.month ?? null;
  if (year !== null && (year < 1900 || year > 2100)) return 'Năm từ 1900 đến 2100';
  if (month !== null && (month < 1 || month > 12)) return 'Tháng từ 1 đến 12';
  return null;
}

export function LoveStorySection({ invitation, etag, onChanged }: SectionProps) {
  const saved = invitation.content.love_story ?? [];
  const [items, setItems] = useState<LoveStoryItemDto[]>(saved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { media, reload: reloadMedia } = useMedia(invitation.id);
  // Chỉ lấy ảnh; nhạc không gắn vào chuyện tình yêu
  const images: MediaDto[] = media.filter((m) => m.mime_type.startsWith('image/'));
  const imageOptions = images.map((m) => ({ value: m.id, label: m.original_filename ?? m.id }));
  const urlById = new Map(images.map((m) => [m.id, m.url]));

  const problems = items.map(itemProblem);
  const valid = problems.every((p) => p === null);
  const payload: LoveStoryItemDto[] = items.map((it) => ({
    title: it.title.trim(),
    description: clean(it.description),
    year: it.year ?? null,
    month: it.month ?? null,
    media_id: it.media_id ?? null,
  }));
  const dirty = JSON.stringify(payload) !== JSON.stringify(saved);

  const update = (index: number, patch: Partial<LoveStoryItemDto>) => {
    setDone(false);
    setItems((xs) => xs.map((x, i) => (i === index ? { ...x, ...patch } : x)));
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    setDone(false);
    setItems((xs) => {
      const next = [...xs];
      const a = next[index];
      const b = next[target];
      if (!a || !b) return xs;
      next[index] = b;
      next[target] = a;
      return next;
    });
  };

  // Tải ảnh mới lên thiệp rồi gắn vào mục đang chọn
  const uploadFor = async (index: number, file: File) => {
    setUploadingIndex(index);
    setUploadError(null);
    try {
      const uploaded = await uploadMedia(invitation.id, file);
      update(index, { media_id: uploaded.id });
      await reloadMedia();
    } catch (err) {
      setUploadError(getErrorMessage(err));
    } finally {
      setUploadingIndex(null);
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setDone(false);
    try {
      // Mảng được gửi nguyên khối: merge patch thay thế toàn bộ danh sách
      await invitationService.update(invitation.id, { content: { love_story: payload } }, etag);
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
      <Group justify="space-between">
        <Title order={3}>Chuyện tình yêu</Title>
        <Button
          variant="light"
          color="pink"
          radius="md"
          disabled={items.length >= MAX_ITEMS}
          onClick={() => {
            setDone(false);
            setItems((xs) => [...xs, emptyItem()]);
          }}
        >
          Thêm mục
        </Button>
      </Group>

      {error && <Alert color="red">{error}</Alert>}
      {uploadError && <Alert color="red">{uploadError}</Alert>}
      {done && !dirty && <Alert color="green">Đã lưu.</Alert>}
      {items.length === 0 && (
        <Text c="dimmed" fz="sm">
          Chưa có mục chuyện tình yêu nào.
        </Text>
      )}

      {items.map((it, i) => {
        const url = it.media_id ? urlById.get(it.media_id) : undefined;
        return (
          <Card key={i} withBorder radius="md" padding="md">
            <Stack gap="sm">
              <TextInput label="Tiêu đề" maxLength={100} value={it.title} onChange={(e) => update(i, { title: e.currentTarget.value })} />
              <Textarea
                label="Nội dung"
                maxLength={1000}
                autosize
                minRows={2}
                value={it.description ?? ''}
                onChange={(e) => update(i, { description: e.currentTarget.value })}
              />
              <Group grow align="flex-start">
                <NumberInput
                  label="Năm"
                  min={1900}
                  max={2100}
                  allowDecimal={false}
                  value={it.year ?? ''}
                  onChange={(v) => update(i, { year: typeof v === 'number' ? v : null })}
                />
                <NumberInput
                  label="Tháng"
                  min={1}
                  max={12}
                  allowDecimal={false}
                  value={it.month ?? ''}
                  onChange={(v) => update(i, { month: typeof v === 'number' ? v : null })}
                />
              </Group>

              <Stack gap={4}>
                <Text fz="sm" fw={600}>Ảnh</Text>
                {url && <Image src={url} alt={it.title} h={160} w={160} radius="md" fit="cover" />}
                <Select
                  placeholder={imageOptions.length ? 'Chọn ảnh có sẵn' : 'Chưa có ảnh nào trong thiệp'}
                  data={imageOptions}
                  value={it.media_id ?? null}
                  onChange={(v) => update(i, { media_id: v })}
                  searchable
                  clearable
                  disabled={imageOptions.length === 0}
                />
                <Group gap="xs">
                  <FileButton accept="image/jpeg,image/png,image/webp,image/avif" onChange={(file) => file && void uploadFor(i, file)}>
                    {(props) => (
                      <Button {...props} size="xs" variant="light" color="pink" loading={uploadingIndex === i}>
                        Tải ảnh mới
                      </Button>
                    )}
                  </FileButton>
                  {it.media_id && (
                    <Button size="xs" variant="subtle" color="gray" onClick={() => update(i, { media_id: null })}>
                      Bỏ ảnh
                    </Button>
                  )}
                </Group>
              </Stack>

              {problems[i] && (
                <Text fz="sm" c="red">
                  {problems[i]}
                </Text>
              )}
              <Group justify="space-between">
                <Group gap="xs">
                  <Button size="xs" variant="subtle" color="gray" disabled={i === 0} onClick={() => move(i, -1)}>
                    Lên
                  </Button>
                  <Button size="xs" variant="subtle" color="gray" disabled={i === items.length - 1} onClick={() => move(i, 1)}>
                    Xuống
                  </Button>
                </Group>
                <Button
                  size="xs"
                  variant="subtle"
                  color="red"
                  onClick={() => {
                    setDone(false);
                    setItems((xs) => xs.filter((_, idx) => idx !== i));
                  }}
                >
                  Xóa
                </Button>
              </Group>
            </Stack>
          </Card>
        );
      })}

      <Group justify="flex-end">
        <Button color="pink" radius="md" loading={saving} disabled={!dirty || !valid || saving} onClick={() => void save()}>
          Lưu chuyện tình yêu
        </Button>
      </Group>
    </Stack>
  );
}