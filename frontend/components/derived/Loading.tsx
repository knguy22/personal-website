/* Taken from https://github.com/loadingio/css-spinner/ */

import styles from './Loading.module.css';
import { cn } from '@/lib/utils';

interface LoadingProps {
  className?: string
}

export default function Loading( {className} : LoadingProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={styles.ldsRing}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      </div>
    </div>
  )
}