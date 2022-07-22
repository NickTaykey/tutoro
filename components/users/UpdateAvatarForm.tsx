import { useState, ChangeEvent, MouseEvent, useContext } from 'react';
import { useSession } from 'next-auth/react';
import { UserDocumentObject } from '../../models/User';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Center,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  Spinner,
} from '@chakra-ui/react';
import { FaBroom, FaFileUpload, FaTrash } from 'react-icons/fa';
import ClusterMapContext from '../../store/cluster-map-context';
import type { CloudFile } from '../../types';
import ApiHelper from '../../utils/api-helper';

interface Props {
  setNewAvatarUrl(newAvatar: string): void;
  setShowDefaultAvatar(newState: boolean): void;
  closeUpdateAvatarModal(): void;
  showResetAvatarBtn: boolean;
}

const UpdateAvatarForm: React.FC<Props> = props => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { data } = useSession();
  const currentUser = data?.user as UserDocumentObject;
  const clusterMapCtx = useContext(ClusterMapContext);

  const onFileUploadChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;

    if (!fileInput.files) {
      alert('No file was chosen');
      return;
    }

    if (!fileInput.files || fileInput.files.length === 0) {
      alert('Files list is empty');
      return;
    }

    const file = fileInput.files[0];

    if (!file.type.startsWith('image')) {
      alert('Please select a valide image');
      return;
    }

    setFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    e.currentTarget.type = 'text';
    e.currentTarget.type = 'file';
  };

  const onCancelFile = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!previewUrl && !file) {
      return;
    }
    setFile(null);
    setPreviewUrl(null);
  };

  const onUploadFile = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!file) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      setIsUploading(true);

      const {
        error,
        newAvatar,
      }: {
        error: string | null;
        newAvatar: CloudFile | null;
      } = await ApiHelper(`/api/${currentUser._id}`, formData, 'PUT', false);

      if (error || (!error && !newAvatar)) {
        return setErrorAlert(
          error || 'Unexpected server side error... try again later.'
        );
      }
      props.closeUpdateAvatarModal();
      props.setNewAvatarUrl(newAvatar!.url);
      props.setShowDefaultAvatar(false);

      if (currentUser.isTutor) {
        clusterMapCtx.updateAuthenticatedTutorAvatar(newAvatar!);
      }
      setIsUploading(false);
    } catch (error) {
      setErrorAlert('Unexpected server side error... try again later.');
    }
  };

  const resetDefaultAvatar = async () => {
    try {
      const res = await fetch(`/api/${currentUser._id}`, {
        method: 'PUT',
      });
      const {
        error,
      }: {
        error: string | null;
      } = await res.json();
      if (error) {
        return setErrorAlert(
          error || 'Unexpected server side error... try again later.'
        );
      }
      props.closeUpdateAvatarModal();
      props.setShowDefaultAvatar(true);
      if (currentUser.isTutor) {
        clusterMapCtx.updateAuthenticatedTutorAvatar({
          url: '',
          public_id: '',
        });
      }
    } catch (error) {
      setErrorAlert('Unexpected server side error... try again later.');
    }
  };

  return (
    <form onSubmit={e => e.preventDefault()}>
      {previewUrl ? (
        <Center>
          <Avatar name={currentUser.fullname} src={previewUrl} size="xl" />
        </Center>
      ) : (
        <FormControl mb="2">
          <FormLabel htmlFor="avatar-input">
            Select an image as your new Avatar
          </FormLabel>
          <Input
            id="avatar-input"
            type="file"
            name="avatar"
            my="2"
            onChange={onFileUploadChange}
          />
          <FormHelperText>Allowed formats: jpg, jpeg and png</FormHelperText>
        </FormControl>
      )}
      {file && (
        <Box mt="2">
          {isUploading ? (
            <Center>
              <Spinner
                my="3"
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
              />
            </Center>
          ) : (
            <>
              <IconButton
                width="100%"
                mb="2"
                aria-label="Clear avatar input"
                colorScheme="red"
                icon={<FaBroom />}
                onClick={onCancelFile}
              />
              <IconButton
                aria-label="Upload image"
                width="100%"
                mb="2"
                colorScheme="blue"
                onClick={onUploadFile}
                icon={<FaFileUpload />}
              />
            </>
          )}
        </Box>
      )}
      {props.showResetAvatarBtn && !isUploading && (
        <Button
          mt="2"
          leftIcon={<FaTrash />}
          color="red"
          variant="outline"
          onClick={resetDefaultAvatar}
        >
          Reset default avatar
        </Button>
      )}
      {errorAlert && (
        <Alert status="error" my="2">
          {errorAlert}
        </Alert>
      )}
    </form>
  );
};

export default UpdateAvatarForm;
