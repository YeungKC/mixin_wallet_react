import "dayjs/locale/zh-cn"
import "dayjs/locale/en"

import dayjs from "dayjs"
import localizedFormat from "dayjs/plugin/localizedFormat"

import i18n from "../i18n"

dayjs.extend(localizedFormat)

const formatDate = (date: string, format: string) =>
  dayjs(date).locale(i18n.language.toLocaleLowerCase()).format(format)

export default formatDate
