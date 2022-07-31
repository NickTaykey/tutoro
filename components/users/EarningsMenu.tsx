import { useContext } from 'react';
import AuthenticatedUserContext from '../../store/authenticated-user-context';
import { PieChart } from 'react-minimal-pie-chart';
import colors from '../../theme/colors';
import { Box, Flex, Heading, Hide, useColorModeValue } from '@chakra-ui/react';

const EarningsMenu: React.FC = () => {
  const { user } = useContext(AuthenticatedUserContext);
  const total = user!.postEarnings + user!.sessionEarnings;
  const postsPercentage = +((100 * user!.postEarnings) / total).toFixed(1);
  const sessionsPercentage = +((100 * user!.sessionEarnings) / total).toFixed(
    1
  );
  const labelColor = useColorModeValue(
    'var(--chakra-colors-gray-800)',
    'white'
  );
  return (
    <Box mx="auto">
      <Heading as="h2" size="xl" textAlign={'center'} mb="5">
        Total: €{total}
      </Heading>
      {postsPercentage || sessionsPercentage ? (
        <>
          <Flex justify="center">
            <Flex alignItems="center" justify="center" mr="5">
              <Box
                width="25px"
                height="25px"
                bgColor={colors.primaryV3}
                mr="2"
              />
              <Heading as="h4" size="sm">
                Sessions
              </Heading>
            </Flex>
            <Flex alignItems="center" justify="center" mr="3">
              <Box
                width="25px"
                height="25px"
                bgColor={colors.dangerV1}
                mr="2"
              />
              <Heading as="h4" size="sm">
                Posts
              </Heading>
            </Flex>
          </Flex>
          <Hide above="md">
            <Heading
              as="h4"
              size="sm"
              fontWeight="normal"
              my="4"
              textAlign="center"
            >
              {sessionsPercentage}% Sessions
            </Heading>
            <Heading
              as="h4"
              size="sm"
              fontWeight="normal"
              mt="4"
              textAlign="center"
            >
              {postsPercentage}% Posts
            </Heading>
          </Hide>
          <PieChart
            viewBoxSize={[150, 150]}
            center={[75, 75]}
            labelStyle={{
              fontSize: '.75rem',
              fontWeight: 'bold',
              fill: labelColor,
              transform:
                !postsPercentage || !sessionsPercentage
                  ? 'translate(25px, 0px)'
                  : 'none',
            }}
            radius={50}
            data={[
              {
                title: `${postsPercentage}% of total amount earnt from Posts`,
                value: postsPercentage,
                color: colors.dangerV1,
              },
              {
                title: `${sessionsPercentage}% of total amount earnt from Sessions`,
                value: sessionsPercentage,
                color: colors.primaryV3,
              },
            ]}
          />
        </>
      ) : (
        <Heading
          as="h4"
          size="sm"
          textAlign="center"
          mb="4"
          fontWeight="normal"
        >
          No earnings for now!
        </Heading>
      )}
    </Box>
  );
};

export default EarningsMenu;
