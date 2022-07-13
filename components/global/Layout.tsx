import Navbar from './Navbar';
import { Box } from '@chakra-ui/react';

const Layout: React.FC<{ children: React.ReactNode[] | React.ReactNode }> = ({
  children,
}) => (
  <>
    <Navbar />
    <Box mt="5">{children}</Box>
  </>
);

export default Layout;
