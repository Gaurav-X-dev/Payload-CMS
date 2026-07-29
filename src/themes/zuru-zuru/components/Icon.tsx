import {
  ArrowRightIcon, BowlFoodIcon, BriefcaseIcon, CalendarIcon, CaretDownIcon, CaretUpIcon,
  CheckCircleIcon, ClockIcon, EnvelopeIcon, FacebookLogoIcon, FlagBannerIcon, ForkKnifeIcon,
  FishSimpleIcon, HeartIcon, InstagramLogoIcon, LeafIcon, MagnifyingGlassIcon, MapPinIcon, MedalIcon,
  MopedIcon, PhoneIcon, StarIcon, TwitterLogoIcon, UsersIcon, YoutubeLogoIcon,
} from '@phosphor-icons/react/dist/ssr'
import type { IconProps } from '@phosphor-icons/react'
import type { ComponentType } from 'react'

const icons: Record<string, ComponentType<IconProps>> = {
  arrow: ArrowRightIcon, bowl: BowlFoodIcon, briefcase: BriefcaseIcon, calendar: CalendarIcon,
  caretDown: CaretDownIcon, caretUp: CaretUpIcon, check: CheckCircleIcon,
  clock: ClockIcon, email: EnvelopeIcon, facebook: FacebookLogoIcon, flag: FlagBannerIcon,
  fish: FishSimpleIcon, food: ForkKnifeIcon, heart: HeartIcon, instagram: InstagramLogoIcon, leaf: LeafIcon,
  map: MapPinIcon, medal: MedalIcon, moped: MopedIcon, phone: PhoneIcon,
  search: MagnifyingGlassIcon, star: StarIcon, twitter: TwitterLogoIcon,
  users: UsersIcon, youtube: YoutubeLogoIcon,
}

export function Icon({ name, ...props }: { name: string } & IconProps) {
  const Component = icons[name] ?? StarIcon
  return <Component aria-hidden="true" {...props} />
}
