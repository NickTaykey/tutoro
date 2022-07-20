import { useState, ChangeEvent, MouseEvent } from 'react';
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
} from '@chakra-ui/react';
import { FaBroom, FaFileUpload, FaTrash } from 'react-icons/fa';

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
  const { data: currentUser } = useSession();

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
      const res = await fetch(
        `/api/${(currentUser?.user as UserDocumentObject)._id}`,
        {
          method: 'PUT',
          body: formData,
        }
      );
      const {
        error,
        newAvatarUrl,
      }: {
        error: string | null;
        newAvatarUrl: string | null;
      } = await res.json();
      if (error || (!error && !newAvatarUrl)) {
        return setErrorAlert(
          error || 'Unexpected server side error... try again later.'
        );
      }
      props.closeUpdateAvatarModal();
      props.setNewAvatarUrl(newAvatarUrl!);
      props.setShowDefaultAvatar(false);
    } catch (error) {
      setErrorAlert('Unexpected server side error... try again later.');
    }
  };

  const resetDefaultAvatar = async () => {
    try {
      const res = await fetch(
        `/api/${(currentUser?.user as UserDocumentObject)._id}`,
        {
          method: 'PUT',
        }
      );
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
    } catch (error) {
      setErrorAlert('Unexpected server side error... try again later.');
    }
  };

  return (
    <form onSubmit={e => e.preventDefault()}>
      {previewUrl ? (
        <Center>
          <Avatar
            name={currentUser!.user!.name as string}
            src={previewUrl}
            size="xl"
          />
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
        </Box>
      )}
      {props.showResetAvatarBtn && (
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
