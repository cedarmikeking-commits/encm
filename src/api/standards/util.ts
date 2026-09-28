import { Standard } from '@/api/standards/type';

export const getLevelBgColor2 = (color: string) => {
  switch (color) {
    case "blue":
      return "bg-blue-50";
    case "green":
      return "bg-green-50";
    case "cyan":
      return "bg-cyan-50";
    case "orange":
      return "bg-orange-50";
    case "red":
      return "bg-red-50";
    case "purple":
      return "bg-purple-50";
    default:
      return "bg-gray-50";
  }
}

export const getLevelBorderColor = (color: string) => {
  switch (color) {
    case "blue":
      return "border-blue-200";
    case "green":
      return "border-green-200";
    case "cyan":
      return "border-cyan-200";
    case "orange":
      return "border-orange-200";
    case "red":
      return "border-red-200";
    case "purple":
      return "border-purple-200";
    default:
      return "border-gray-200";
  }
}

export const getLevelColor = (color: string) => {
  switch (color) {
    case "blue":
      return "bg-blue-500";
      break;
    case "green":
      return "bg-green-500";
      break;
    case "cyan":
      return "bg-cyan-500";
      break;
    case "orange":
      return "bg-orange-500";
      break;
    case "red":
      return "bg-red-500";
      break;
    case "purple":
      return "bg-purple-500";
      break;
    default:
      return "bg-gray-500";
  }
}

export const getLevelBgColor = (color: string) => {
  switch (color) {
    case "blue":
      return "bg-blue-100";
    case "green":
      return "bg-green-100";
    case "cyan":
      return "bg-cyan-100";
    case "orange":
      return "bg-orange-100";
    case "red":
      return "bg-red-100";
    case "purple":
      return "bg-purple-100";
    default:
      return "bg-gray-100";
  }
}

export const getLevelFontColor = (color: string) => {
  switch (color) {
    case "blue":
      return 'text-blue-700';
    case "green":
      return 'text-green-700';
    case "cyan":
      return 'text-cyan-700';
    case "orange":
      return 'text-orange-700';
    case "red":
      return 'text-red-700';
    case "purple":
      return 'text-purple-700';
    default:
      return 'text-gray-700';
  }
}

export const getDephyColor = (level: number) => {
  switch (level) {
    case 1: return 'blue';
    case 2: return 'green';
    case 3: return 'orange';
    case 4: return 'purple';
    default: return 'default';
  }
};
export const getstandardName = (dic_Standards: Standard[], id: string) => {

  return dic_Standards.find(a => a.id == id)?.standardName;

}

export const getStatusInfo = (status: number) => {
  const statusMap: { [key: string]: { text: string; color: string } } = {
    0: { text: '草稿', color: 'orange' },
    1: { text: '已发布', color: 'green' },
    2: { text: '已归档', color: 'default' }
  };
  return statusMap[status] || { text: status, color: 'default' };
};

export const colorOptions = [
  { value: 'green', label: '绿色', hex: '#059669' },
  { value: 'blue', label: '蓝色', hex: '#1d4ed8' },
  { value: 'cyan', label: '青色', hex: '#06b6d4' },
  { value: 'orange', label: '橙色', hex: '#d97706' },
  { value: 'red', label: '红色', hex: '#dc2626' },
  { value: 'purple', label: '紫色', hex: '#a855f7' }
];