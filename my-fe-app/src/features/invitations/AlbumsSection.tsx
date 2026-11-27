import { Alert, Button, Card, Chip, FileButton, Group, Select, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import { useState } from 'react';
import { useTemplate } from '../templates/useTemplates';
import { albumService, type AlbumDto } from '../../services/album.service';
import { getErrorMessage } from '../../services/http';
import type { InvitationDto } from '../../services/invitation.service';
import { mediaService, uploadMedia, type MediaDto } from '../../services/media.service';
import { useAlbums } from './useAlbums';
import { useMedia } from './useMedia';

// Giá trị đại diện cho "chưa xếp album"
const NONE = '__none__';

function messageOf(err: unknown): string {
  if (err instanceof Error) return err.message;
  return getErrorMessage(err) ?? 'Có lỗi xảy ra, thử lại sau.';
}

// Ô sửa tên album đang chọn. Dùng key theo id album để form reset khi đổi album.
function AlbumEditor({
  album,
  disabled,
  onRename,
  onDelete,
}: {
  album: AlbumDto;
  disabled: boolean;
  onRename: (title: string) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(album.title);
  const trimmed = title.trim();
  const changed = trimmed !== '' && trimmed !== album.title;

  return (
    <Group align="flex-end">
      <TextInput
        label="Tên album"
        maxLength={120}
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
        style={{ flex: 1 }}
      />
      <Button variant="light" color="pink" disabled={!changed || disabled} onClick={() => onRename(trimmed)}>
        Đổi tên
      </Button>
      <Button variant="subtle" color="red" disabled={disabled} onClick={onDelete}>
        Xóa album
      </Button>
    </Group>
  );
}

type Props = { invitation: InvitationDto };

export function AlbumsSection({ invitation }: Props) {
  const { media, error: mediaError, reload: reloadMedia } = useMedia(invitation.id);
  const { albums, error: albumsError, reload: reloadAlbums } = useAlbums(invitation.id);
  const { data: template } = useTemplate(invitation.template_key);

  const [selected, setSelected] = useState<string>(NONE);
  const [newTitle, setNewTitle] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const limit = template?.manifest.max_gallery_images;

  // Thư viện: mọi ảnh không phải ảnh bìa, ảnh chú rể, ảnh cô dâu
  const slotIds = [
    invitation.cover_media_id,
    invitation.groom_photo_media_id,
    invitation.bride_photo_media_id,
  ].filter((id): id is string => !!id);
  const gallery = media.filter((m) => m.mime_type.startsWith('image/') && !slotIds.includes(m.id));
  const full = limit !== undefined && gallery.length >= limit;

  const albumId = selected === NONE ? null : selected;
  const current: AlbumDto | null = albums.find((a) => a.id === selected) ?? null;
  const shown: MediaDto[] = gallery.filter((m) => m.album_id === albumId);

  const albumOptions = [
    { value: NONE, label: 'Chưa xếp album' },
    ...albums.map((a) => ({ value: a.id, label: a.title })),
  ];

  // Chạy một thao tác rồi tải lại ảnh và album
  const runAction = async (key: string, fn: () => Promise<unknown>) => {
    setBusy(key);
    setActionError(null);
    try {
      await fn();
      await Promise.all([reloadMedia(), reloadAlbums()]);
    } catch (err) {
      setActionError(messageOf(err));
    } finally {
      setBusy(null);
    }
  };

  const createAlbum = () => {
    const title = newTitle.trim();
    if (!title) return;
    void runAction('create-album', async () => {
      const { data } = await albumService.create(invitation.id, title);
      setNewTitle('');
      setSelected(data.id);
    });
  };

  const renameAlbum = (album: AlbumDto, title: string) =>
    void runAction('rename', () => albumService.update(invitation.id, album.id, { title }));

  const deleteAlbum = (album: AlbumDto) => {
    if (!window.confirm(`Xóa album "${album.title}"?`)) return;
    void runAction('delete-album', async () => {
      await albumService.remove(invitation.id, album.id);
      setSelected(NONE);
    });
  };

  const uploadFiles = (files: File[]) => {
    // Không vượt quá số ảnh tối đa của mẫu
    const room = limit === undefined ? files.length : Math.max(0, limit - gallery.length);
    const picked = files.slice(0, room);
    if (picked.length === 0) return;

    void runAction('upload', async () => {
      for (const file of picked) await uploadMedia(invitation.id, file, albumId);
    });
  };

  const moveTo = (m: MediaDto, target: string) =>
    void runAction(`move-${m.id}`, () =>
      mediaService.move(invitation.id, m.id, target === NONE ? null : target),
    );

  // Đổi chỗ ảnh với ảnh liền trước/sau trong cùng album đang hiển thị
  const moveImage = (m: MediaDto, dir: -1 | 1) => {
    const si = shown.findIndex((x) => x.id === m.id);
    const target = shown[si + dir];
    if (si < 0 || !target) return;

    const order = media.filter((x) => x.mime_type.startsWith('image/')).map((x) => x.id);
    const a = order.indexOf(m.id);
    const b = order.indexOf(target.id);
    if (a < 0 || b < 0) return;
    const tmp = order[a];
    order[a] = order[b] as string;
    order[b] = tmp as string;
    void runAction('reorder', () => mediaService.reorder(invitation.id, order));
  };

  const removePhoto = (m: MediaDto) => {
    if (!window.confirm('Xóa ảnh này?')) return;
    void runAction('remove-photo', () => mediaService.remove(invitation.id, m.id));
  };

  const disabled = busy !== null;

  return (
    <Stack gap="md">
      <Title order={3}>Album ảnh</Title>

      {!!mediaError && <Alert color="red">{getErrorMessage(mediaError)}</Alert>}
      {!!albumsError && <Alert color="red">{getErrorMessage(albumsError)}</Alert>}
      {actionError && <Alert color="red">{actionError}</Alert>}

      <Chip.Group value={selected} onChange={(v) => setSelected(String(v))}>
        <Group gap="xs">
          <Chip value={NONE} variant="outline">
            Chưa xếp album
          </Chip>
          {albums.map((a) => (
            <Chip key={a.id} value={a.id} variant="outline">
              {a.title} ({a.media_count})
            </Chip>
          ))}
        </Group>
      </Chip.Group>

      <Group align="flex-end">
        <TextInput
          label="Album mới"
          placeholder="Ví dụ: Lễ ăn hỏi"
          maxLength={120}
          value={newTitle}
          onChange={(e) => setNewTitle(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Button
          color="pink"
          variant="light"
          loading={busy === 'create-album'}
          disabled={!newTitle.trim() || disabled}
          onClick={createAlbum}
        >
          Tạo album
        </Button>
      </Group>

      {current && (
        <AlbumEditor
          key={current.id}
          album={current}
          disabled={disabled}
          onRename={(title) => renameAlbum(current, title)}
          onDelete={() => deleteAlbum(current)}
        />
      )}

      <Stack gap={4}>
        <FileButton multiple accept="image/*" onChange={uploadFiles} disabled={full || disabled}>
          {(props) => (
            <Button
              {...props}
              variant="light"
              color="pink"
              loading={busy === 'upload'}
              disabled={full || disabled}
              style={{ alignSelf: 'flex-start' }}
            >
              Tải ảnh vào {current ? current.title : 'Chưa xếp album'}
            </Button>
          )}
        </FileButton>
        <Text fz="sm" c="dimmed">
          {limit !== undefined ? `Thư viện: ${gallery.length} / ${limit} ảnh` : `Thư viện: ${gallery.length} ảnh`}
        </Text>
        {full && (
          <Text fz="sm" c="dimmed">
            Đã đạt tối đa số ảnh của mẫu này.
          </Text>
        )}
      </Stack>

      <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="sm">
        {shown.map((m) => (
          <Card key={m.id} withBorder radius="md" padding={6}>
            <Stack gap={6}>
              <img
                src={m.url}
                alt={m.original_filename ?? 'Ảnh'}
                style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 6 }}
              />
              <Select
                size="xs"
                data={albumOptions}
                value={m.album_id ?? NONE}
                onChange={(v) => moveTo(m, v ?? NONE)}
                allowDeselect={false}
                disabled={disabled}
              />
              <Group gap={4} grow>
                <Button
                  size="xs"
                  variant="subtle"
                  color="gray"
                  disabled={disabled || shown.indexOf(m) === 0}
                  onClick={() => moveImage(m, -1)}
                >
                  Trước
                </Button>
                <Button
                  size="xs"
                  variant="subtle"
                  color="gray"
                  disabled={disabled || shown.indexOf(m) === shown.length - 1}
                  onClick={() => moveImage(m, 1)}
                >
                  Sau
                </Button>
              </Group>
              <Button size="xs" variant="subtle" color="red" disabled={disabled} onClick={() => removePhoto(m)}>
                Xóa ảnh
              </Button>
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      {shown.length === 0 && (
        <Text c="dimmed" fz="sm">
          Chưa có ảnh nào ở đây.
        </Text>
      )}
    </Stack>
  );
}