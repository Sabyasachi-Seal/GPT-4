import * as React from 'react';

import type { SxProps } from '@mui/joy/styles/types';
import { Box, Button, ColorPaletteProp } from '@mui/joy';
import AbcIcon from '@mui/icons-material/Abc';
import CodeIcon from '@mui/icons-material/Code';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import RecordVoiceOverOutlinedIcon from '@mui/icons-material/RecordVoiceOverOutlined';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import TextureIcon from '@mui/icons-material/Texture';

import { ContentScaling, themeScalingMap } from '~/common/app.theme';
import { DMessageAttachmentFragment, DMessageFragmentId, DVMimeType, isDocPart } from '~/common/stores/chat/chat.fragments';
import { LiveFileIcon } from '~/common/livefile/liveFile.icons';
import { TooltipOutlined } from '~/common/components/TooltipOutlined';
import { ellipsizeMiddle } from '~/common/util/textUtils';
import { useLiveFileMetadata } from '~/common/livefile/useLiveFileMetadata';


// configuration
export const DocSelColor: ColorPaletteProp = 'primary';
const DocUnselColor: ColorPaletteProp = 'primary';


export function buttonIconForFragment(part: DMessageAttachmentFragment['part']): React.ComponentType<any> {
  const pt = part.pt;
  switch (pt) {

    // Reference Attachment Fragment
    case 'reference':
      const rt = part.rt;
      switch (rt) {
        case 'zync':
          const rZType = part.zType;
          switch (rZType) {
            case 'asset':
              const assetType = part.assetType;
              switch (assetType) {
                case 'image':
                  return ImageOutlinedIcon;
                case 'audio':
                  return RecordVoiceOverOutlinedIcon;
                default:
                  const _exhaustiveCheck: never = assetType;
                  return TextureIcon; // missing zync asset type
              }
            default:
              const _exhaustiveCheck: never = rZType;
              return TextureIcon; // missing zync entity type
          }

        case '_sentinel':
          return TextureIcon; // nothing to do here - this is a sentinel type

        default:
          const _exhaustiveCheck: never = rt;
          return TextureIcon; // case missing
      }

    // Document Attachment Fragment
    case 'doc':
      switch (part.vdt) {
        case DVMimeType.TextPlain:
          return TextFieldsIcon;
        case DVMimeType.VndAgiCode:
          return CodeIcon;
        case DVMimeType.VndAgiOcr:
          return part.meta?.srcOcrFrom === 'image' ? AbcIcon : PictureAsPdfIcon;
        // NOTE: the objective is to grow this set, but wisely
        // - no rush to fill the space, as we need data at rest & in flight (for auto type conversion) support,
        //   including the reintepretation of the deta in the Aix.Adapters
        // case INT_MIME_VND_AGI_EGO_FRAGMENTS:
        //   return TelegramIcon;
        // case INT_MIME_AGI_TEXT_HTML:
        //   return CodeIcon;
        // case 'text/markdown':
        //   return CodeIcon;
        default:
          const _exhaustiveCheck: never = part.vdt;
          return TextureIcon; // unknown doc type
      }

    // [OLD-style] Image Attachment Fragment
    case 'image_ref':
      return ImageOutlinedIcon;

    case '_pt_sentinel':
      return TextureIcon; // nothing to do here - this is a sentinel type

    default:
      const _exhaustiveCheck: never = pt;
      return TextureIcon; // case missing
  }
}


export function DocAttachmentFragmentButton(props: {
  fragment: DMessageAttachmentFragment,
  contentScaling: ContentScaling,
  isSelected: boolean,
  isSelectable: boolean,
  toggleSelected: (fragmentId: DMessageFragmentId) => void,
}) {

  // external state
  const liveFileMetadata = useLiveFileMetadata(props.fragment.liveFileId);

  // derived state
  const { fragment, isSelected, toggleSelected } = props;
  const hasLiveFile = !!liveFileMetadata;
  const isLiveFilePaired = liveFileMetadata ? liveFileMetadata.isPairingValid || false : false;

  // handlers
  const handleSelectFragment = React.useCallback(() => {
    toggleSelected(fragment.fId);
  }, [fragment.fId, toggleSelected]);

  // memos
  const buttonSx = React.useMemo((): SxProps => ({
    // from ATTACHMENT_MIN_STYLE
    // height: '100%',
    minHeight: props.contentScaling === 'md' ? 40 : props.contentScaling === 'sm' ? 38 : 36,
    minWidth: '64px',
    maxWidth: '340px',
    padding: 0,

    // style
    fontSize: themeScalingMap[props.contentScaling]?.fragmentButtonFontSize ?? undefined,
    border: '1px solid',
    borderRadius: 'sm',
    boxShadow: isSelected ? undefined : `0px 3px 4px -2px rgb(var(--joy-palette-${isSelected ? DocSelColor : DocUnselColor}-darkChannel) / ${isSelected ? 50 : 20}%)`,
    ...isSelected ? {
      borderColor: `${DocSelColor}.solidBg`,
    } : {
      borderColor: `${DocUnselColor}.outlinedBorder`,
      backgroundColor: 'background.popup',
    },

    // from LLMAttachmentButton
    display: 'flex', flexDirection: 'row',
  }), [isSelected, props.contentScaling]);

  // only operate on doc fragments
  if (!isDocPart(fragment.part))
    return 'Unexpected: ' + fragment.part.pt;

  const buttonText = ellipsizeMiddle(fragment.part.l1Title || fragment.title || 'Document', 28 /* totally arbitrary length */);

  const Icon = isSelected ? EditRoundedIcon : buttonIconForFragment(fragment.part);

  return (
    <Button
      size={props.contentScaling === 'md' ? 'md' : 'sm'}
      variant={isSelected ? 'solid' : 'soft'}
      color={isSelected ? DocSelColor : DocUnselColor}
      disabled={!props.isSelectable}
      onClick={handleSelectFragment}
      sx={buttonSx}
    >
      {!!Icon && (
        <Box sx={{
          height: '80%', // was 100%, but it's neat-o to have the line a bit engraved
          paddingX: '0.5rem',
          borderRight: '1px solid',
          borderRightColor: isSelected ? `${DocSelColor}.solidBg` : `${DocUnselColor}.outlinedDisabledBorder`, // this was outlinedBorder
          display: 'flex', alignItems: 'center',
        }}>
          <Icon />
        </Box>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingX: '0.5rem' }}>
        <Box sx={{ whiteSpace: 'nowrap', fontWeight: 'md', minWidth: 48 }}>
          {buttonText}
        </Box>
        {/*<Box sx={{ fontSize: 'xs', fontWeight: 'sm' }}>*/}
        {/*  {fragment.caption}*/}
        {/*</Box>*/}
      </Box>
      {hasLiveFile && (
        <TooltipOutlined
          title={!isLiveFilePaired ? 'LiveFile needs re-pairing.' : 'LiveFile is supported'}
          color={!isLiveFilePaired ? 'danger' : 'success'}
          placement='top-end'
        >
          <LiveFileIcon
            color={!isSelected ? 'success' : undefined}
            sx={{ mr: '0.5rem', color: (!isLiveFilePaired && !isSelected) ? 'darkred' : undefined }}
          />
        </TooltipOutlined>
      )}
    </Button>
  );
}
