import { Button, Select, Space, Tooltip } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'
import Loading from 'components/shared/Loading'
import ProjectsGrid from 'components/shared/ProjectsGrid'
import { layouts } from 'constants/styles/layouts'
import { ThemeContext } from 'contexts/themeContext'
import { useProjects } from 'hooks/Projects'
import { ProjectState } from 'models/project-visibility'
import { useContext, useState } from 'react'

type OrderByOption = 'createdAt' | 'totalPaid'

export default function Projects() {
  const [selectedTab, setSelectedTab] = useState<ProjectState>('active')
  const [orderBy, setOrderBy] = useState<OrderByOption>('totalPaid')

  const {
    theme: { colors },
  } = useContext(ThemeContext)

  const projects = useProjects({
    orderBy,
    orderDirection: 'desc',
    filter: selectedTab,
  })

  const tab = (tab: ProjectState) => (
    <div
      style={{
        textTransform: 'uppercase',
        cursor: 'pointer',
        borderBottom: '2px solid transparent',
        paddingBottom: 6,
        ...(tab === selectedTab
          ? {
              color: colors.text.primary,
              fontWeight: 500,
              borderColor: colors.text.primary,
            }
          : {
              color: colors.text.secondary,
              borderColor: 'transparent',
            }),
      }}
      onClick={() => setSelectedTab(tab)}
    >
      {tab}
    </div>
  )

  return (
    <div style={{ ...layouts.maxWidth }}>
      <h1>Projects on Juicebox</h1>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          marginBottom: 40,
        }}
      >
        <div style={{ height: 40 }}>
          <Space direction="horizontal" size="large">
            {tab('active')}
            {tab('archived')}
          </Space>
        </div>

        <div>
          <Space direction="horizontal">
            <Select
              value={orderBy}
              onChange={setOrderBy}
              style={{ width: 120 }}
            >
              <Select.Option value="totalPaid">Volume</Select.Option>
              <Select.Option value="createdAt">Created</Select.Option>
            </Select>
            <a href="/#/create" style={{ marginLeft: 10 }}>
              <Button>New project</Button>
            </a>
          </Space>
        </div>
      </div>

      {selectedTab === 'archived' && (
        <p style={{ marginBottom: 40, maxWidth: 800 }}>
          <InfoCircleOutlined /> Archived projects have not been modified or
          deleted on the blockchain, and can still be interacted with directly
          through the Juicebox contracts.{' '}
          <Tooltip title="If you have a project you'd like to archive, let the Juicebox team know in Discord.">
            <span
              style={{
                color: colors.text.action.primary,
                fontWeight: 500,
                cursor: 'default',
              }}
            >
              How do I archive a project?
            </span>
          </Tooltip>
        </p>
      )}

      {projects ? <ProjectsGrid projects={projects} /> : <Loading />}
    </div>
  )
}
