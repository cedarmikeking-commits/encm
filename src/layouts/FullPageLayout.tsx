import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';

export default function FullPageLayout() {
  return (
    <Layout className=" max-h-full">
      <Outlet />
    </Layout>
  );
}
