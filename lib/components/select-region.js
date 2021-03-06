import {Alert, Box, Flex, Stack} from '@chakra-ui/core'
import {faMap, faPlus, faSignOutAlt} from '@fortawesome/free-solid-svg-icons'
import get from 'lodash/get'
import React from 'react'

import message from 'lib/message'

import {UserContext} from '../user'

import A from './a'
import {ButtonLink} from './buttons'
import Icon from './icon'
import {ALink} from './link'
import Logo from './logo'

export default function SelectRegion(p) {
  const user = React.useContext(UserContext)
  // Prioritize showing the adminTempAccessGroup for admins.
  const accessGroup = get(
    user,
    'adminTempAccessGroup',
    get(user, 'accessGroup')
  )
  const email = get(user, 'email')

  return (
    <Flex alignItems='center' mb={6} direction='column'>
      <Box mt={8} mb={6}>
        <Logo />
      </Box>
      <Stack spacing={4} textAlign='center' width='320px'>
        <Box>
          signed in as
          <strong>
            {' '}
            {email} ({accessGroup})
          </strong>
        </Box>
        <Alert status='info' borderRadius='4px'>
          <span>
            <strong>June, 2020</strong> — We revamped the single-point analysis
            page to help with comparisons.{' '}
            <A href='/changelog'>Click here to learn more.</A>
          </span>
        </Alert>
        <Box>
          <ButtonLink to='regionCreate' style='success' block>
            <Icon icon={faPlus} /> {message('region.createAction')}
          </ButtonLink>
        </Box>
        {p.regions.length > 0 && <Box>{message('region.goToExisting')}</Box>}
        {p.regions.length > 0 && (
          <Box className='list-group'>
            {p.regions.map((region) => (
              <ALink
                className='list-group-item'
                key={region._id}
                regionId={region._id}
                to='projects'
              >
                <span>
                  <Icon icon={faMap} /> {region.name}
                </span>
              </ALink>
            ))}
          </Box>
        )}
        <Box>
          <ALink to='logout'>
            <Icon icon={faSignOutAlt} /> {message('authentication.logOut')}
          </ALink>
        </Box>
      </Stack>
    </Flex>
  )
}
