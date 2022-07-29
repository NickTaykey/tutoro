import { useState, ChangeEvent, MouseEvent, useContext } from 'react';
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
import {
  FaBroom,
  FaFileUpload,
  FaRegTimesCircle,
  FaTrash,
} from 'react-icons/fa';
import ClusterMapContext from '../../store/cluster-map-context';
import AuthenticatedUserContext from '../../store/authenticated-user-context';

const UpdateAvatarForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const clusterMapCtx = useContext(ClusterMapContext);
  const { user, updateAvatar, resetAvatar, closeUpdateAvatarMenu } = useContext(
    AuthenticatedUserContext
  );

  const onFileUploadChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;

    if (!fileInput.files) {
      return setErrorAlert('No file was chosen');
    }

    if (!fileInput.files || fileInput.files.length === 0) {
      return setErrorAlert('Files list is empty');
    }

    const file = fileInput.files[0];

    if (!file.type.startsWith('image')) {
      return setErrorAlert('Please select a valide image');
    }

    setErrorAlert(null);

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

  const onUploadFile = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);
    setIsUploading(true);
    updateAvatar(formData)
      .then(() => {
        closeUpdateAvatarMenu();
        if (user!.isTutor) {
          clusterMapCtx.updateAuthenticatedTutorAvatar(user!.avatar!);
        }
        setIsUploading(false);
      })
      .catch(({ errorMessage }) => setErrorAlert(errorMessage));
  };

  const resetDefaultAvatar = async () => {
    resetAvatar()
      .then(() => {
        closeUpdateAvatarMenu();
        if (user!.isTutor) {
          clusterMapCtx.updateAuthenticatedTutorAvatar({
            url: '',
            public_id: '',
          });
        }
      })
      .catch(({ errorMessage }) => setErrorAlert(errorMessage));
  };

  return (
    <form onSubmit={e => e.preventDefault()}>
      {errorAlert && (
        <Alert status="error" my="2">
          {errorAlert}
        </Alert>
      )}
      {previewUrl ? (
        <Center>
          <Avatar name={user!.fullname} src={previewUrl} size="xl" />
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
            fontWeight="600"
            fontSize="14"
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
                variant="danger"
                icon={<FaBroom />}
                onClick={onCancelFile}
              />
              <IconButton
                aria-label="Upload image"
                width="100%"
                mb="2"
                variant="primary"
                onClick={onUploadFile}
                icon={<FaFileUpload />}
              />
            </>
          )}
        </Box>
      )}
      {user?.avatar?.url && !isUploading && (
        <Button
          my="4"
          leftIcon={<FaTrash />}
          color="dangerV1"
          variant="outline"
          textTransform="capitalize"
          onClick={resetDefaultAvatar}
        >
          Reset default avatar
        </Button>
      )}
    </form>
  );
};

export default UpdateAvatarForm;
