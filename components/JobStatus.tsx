import React from 'react'
import { useQuery } from "@blitzjs/rpc";
import getJob from 'app/jobs/queries/getJob';
import { ProgressSpinner } from 'primereact/progressspinner';

type Props = {
  id: number,
  title: string
}

export const JobStatus = (props: Props) => {
  const { id, title } = props
  const [job] = useQuery(getJob, {
    id
  })
  return (
    <div className='card'>
      <div className="flex justify-content-between align-items-center">
        <span className="text-base">{title ?? "Job"} #{job.id}</span>
        <span className="text-base">
          <i className={`pi ${job.isRunning ? 'pi-spin pi-spinner' : job.isCompleted ? 'pi-check-circle text-primary' : 'pi-clock'}`} />
        </span>
      </div>
    </div>
  )
}
