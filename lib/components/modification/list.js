import {Box, Flex, Heading, Stack} from '@chakra-ui/core'
import {
  faEyeSlash,
  faPencilAlt,
  faUpload
} from '@fortawesome/free-solid-svg-icons'
import get from 'lodash/get'
import dynamic from 'next/dynamic'
import React from 'react'
import {useDispatch, useSelector} from 'react-redux'

import getFeedsRoutesAndStops from 'lib/actions/get-feeds-routes-and-stops'
import {getForProject as loadModifications} from 'lib/actions/modifications'
import {LS_MOM} from 'lib/constants'
import message from 'lib/message'
import * as localStorage from 'lib/utils/local-storage'

import Icon from '../icon'
import InnerDock from '../inner-dock'
import {Group, Input} from '../input'
import Link from '../link'
import Tip from '../tip'
import VariantEditor from '../variant-editor'

import CreateModification from './create'
import ModificationGroup from './group'
import ModificationGroupItem from './group-item'

const ModificationsMap = dynamic(
  () => import('lib/components/modifications-map/display-all'),
  {
    loading: () => null,
    ssr: false
  }
)

function filterModifications(filter, modifications, projectId) {
  const filterLcase = filter != null ? filter.toLowerCase() : ''
  const filteredModificationsByType = {}

  modifications
    .filter((m) => m.projectId === projectId)
    .filter(
      (m) => filter === null || m.name.toLowerCase().indexOf(filterLcase) > -1
    )
    .forEach((m) => {
      filteredModificationsByType[m.type] = [
        ...(filteredModificationsByType[m.type] || []),
        m
      ]
    })

  return filteredModificationsByType
}

export default function ModificationsList(p) {
  const dispatch = useDispatch()
  const {_id: projectId, bundleId, regionId} = p.project
  // Retrieve the modifications from the store. Filter out modifications that might be from another project
  const modifications = useSelector((s) => s.project.modifications)

  // Load modifications
  React.useEffect(() => {
    dispatch(loadModifications(projectId))
  }, [dispatch, projectId])

  // Array of ids for currently displayed modifications
  const [modificationsOnMap, setModificationsOnMap] = React.useState(() =>
    get(localStorage.getParsedItem(LS_MOM), projectId, [])
  )

  // Load the GTFS information for the modifications
  React.useEffect(() => {
    const visibleModifications = modifications.filter((m) =>
      modificationsOnMap.includes(m._id)
    )
    if (visibleModifications.length > 0) {
      dispatch(
        getFeedsRoutesAndStops({
          bundleId,
          forceCompleteUpdate: true,
          modifications: visibleModifications
        })
      )
    }
  }, [bundleId, dispatch, modifications, modificationsOnMap])

  // Set and store modifications on map
  function setAndStoreMoM(newMoM) {
    setModificationsOnMap(newMoM)
    const mom = localStorage.getParsedItem(LS_MOM) || {}
    mom[projectId] = newMoM
    localStorage.stringifyAndSet(LS_MOM, mom)
  }

  const [filter, setFilter] = React.useState('')
  const [filteredModificationsByType, setFiltered] = React.useState({})

  // Update filtered modifications when the filter changes
  React.useEffect(() => {
    setFiltered(filterModifications(filter, modifications, projectId))
  }, [filter, modifications, projectId])

  // Show a variant's modifications on the map
  function showVariant(index) {
    setAndStoreMoM(
      modifications.filter((m) => m.variants[index] === true).map((m) => m._id)
    )
  }

  return (
    <>
      <ModificationsMap />

      <Flex borderBottom='1px solid #E2E8F0' p={4} justify='space-between'>
        <Heading size='md'>
          <Icon icon={faPencilAlt} /> {message('modification.plural')}
        </Heading>
        <Stack fontSize='14px' isInline>
          <Box>
            <Tip
              className='ShowOnMap fa-btn'
              tip='Hide all modifications from map display'
            >
              <a onClick={() => setAndStoreMoM([])}>
                <Icon icon={faEyeSlash} />
              </a>
            </Tip>
          </Box>
          <Box>
            <Tip tip={message('project.importModifications')}>
              <Link
                to='modificationImport'
                projectId={projectId}
                regionId={regionId}
              >
                <a>
                  <Icon icon={faUpload} />
                </a>
              </Link>
            </Tip>
          </Box>
        </Stack>
      </Flex>
      <InnerDock className='block'>
        <VariantEditor
          showVariant={showVariant}
          variants={p.project.variants}
        />

        <CreateModification
          projectId={projectId}
          regionId={regionId}
          variants={p.project.variants}
        />

        <Group>
          <Input
            placeholder={message('modification.filter')}
            onChange={(e) => setFilter(e.target.value)}
            type='text'
            value={filter}
          />
        </Group>

        {Object.keys(filteredModificationsByType).map((type) => {
          const ms = filteredModificationsByType[type]
          return (
            <ModificationGroup
              defaultExpanded={ms.length < 5}
              key={`modification-group-${type}`}
              type={type}
            >
              {ms.map((m) => (
                <ModificationGroupItem
                  hideFromMap={() =>
                    setAndStoreMoM(
                      modificationsOnMap.filter((id) => id !== m._id)
                    )
                  }
                  key={m._id}
                  modification={m}
                  onMap={modificationsOnMap.find((id) => id === m._id)}
                  projectId={projectId}
                  regionId={regionId}
                  showOnMap={() =>
                    setAndStoreMoM(modificationsOnMap.concat(m._id))
                  }
                />
              ))}
            </ModificationGroup>
          )
        })}
      </InnerDock>
    </>
  )
}
