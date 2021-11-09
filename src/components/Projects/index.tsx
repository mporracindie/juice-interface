import { Button, Select, Space } from 'antd'
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
        ...(tab === selectedTab
          ? {
              color: colors.text.primary,
              fontWeight: 500,
            }
          : {
              color: colors.text.secondary,
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
              style={{ width: 180 }}
            >
              <Select.Option value="totalPaid">Total earned</Select.Option>
              <Select.Option value="createdAt">Last created</Select.Option>
            </Select>
            <a href="/#/create" style={{ marginLeft: 10 }}>
              <Button>New project</Button>
            </a>
          </Space>
        </div>
      </div>

      {projects ? <ProjectsGrid projects={projects} /> : <Loading />}
    </div>
  )
}
