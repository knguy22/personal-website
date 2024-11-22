interface PublicCellProps {
    value: string
}

// cell that is not editable
export function PublicCell( {value}: PublicCellProps) {
    return <div className='max-h-10 max-w-44 overflow-auto text-nowrap scrollbar-thin'>{value}</div>
}