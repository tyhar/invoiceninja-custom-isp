import { Route } from 'react-router-dom';
import { lazy } from 'react';
import { Guard } from '$app/common/guards/Guard';
import { permission } from '$app/common/guards/guards/permission';

const WAGateway = lazy(() => import('$app/pages/wa-gateway/WaGateway'));

const WAChat = lazy(() => import('$app/pages/wa-gateway/chat/WaChat'));
const WaChatCreate = lazy(() => import('$app/pages/wa-gateway/chat/WaChatCreate'));
const WaChatDetail = lazy(() => import('$app/pages/wa-gateway/chat/WaChatDetail'));
const WaChatSend = lazy(() => import('$app/pages/wa-gateway/chat/WaChatSend'));

const WaChatTemplate = lazy(() => import('$app/pages/wa-gateway/template/WaChatTemplate'));
const WaChatTemplateDetail = lazy(() => import('$app/pages/wa-gateway/template/WaChatTemplateDetail'));

const WaChatRecurring = lazy(() => import('$app/pages/wa-gateway/chat-recurring/WaChatRecurring'));
const WaChatRecurringCreate = lazy(() => import('$app/pages/wa-gateway/chat-recurring/WaChatRecurringCreate'));
const WaChatRecurringDetail = lazy(() => import('$app/pages/wa-gateway/chat-recurring/WaChatRecurringDetail'));
const WaChatRecurringEdit = lazy(() => import('$app/pages/wa-gateway/chat-recurring/WaChatRecurringEdit'));

const WAChatbot = lazy(() => import('$app/pages/wa-gateway/chatbot/WaChatbot'));
const WaChatbotAdmin = lazy(() => import('$app/pages/wa-gateway/chatbot/WaChatbotAdmin'));


export const waGatewayRoutes = (
  <Route path="/wa-gateway">
    <Route
      index
      element={
        <Guard guards={[permission('view_wa_gateway')]} component={<WAGateway />} />
      }
    />
    <Route
      path="chat/:deviceId"
      element={
        <Guard guards={[permission('view_wa_gateway')]} component={<WAChat />} />
      }
    />
    <Route
      path="chat"
      element={
        <Guard guards={[permission('view_wa_gateway')]} component={<WaChatSend />} />
      }
    />
    <Route
      path="chat/:deviceId/create"
      element={
        <Guard guards={[permission('view_wa_gateway')]} component={<WaChatCreate />} />
      }
    />
    <Route
      path="chat/:deviceId/recurring"
      element={
        <Guard guards={[permission('view_wa_gateway')]} component={<WaChatRecurring />} />
      }
    />
     <Route
      path="chat/:deviceId/recurring/detail/:scheduleId"
      element={
        <Guard guards={[permission('view_wa_gateway')]} component={<WaChatRecurringDetail />} />
      }
    />
    <Route
      path="chat/:deviceId/recurring/edit/:scheduleId"
      element={
        <Guard guards={[permission('view_wa_gateway')]} component={<WaChatRecurringEdit />} />
      }
    />
    <Route
      path="chat/:deviceId/recurring/create"
      element={
        <Guard guards={[permission('view_wa_gateway')]} component={<WaChatRecurringCreate />} />
      }
    />
    <Route
      path="chat/detail/:chatId"
      element={
        <Guard guards={[permission('view_wa_gateway')]} component={<WaChatDetail />} />
      }
    />
    <Route
      path="chat/template"
      element={
        <Guard guards={[permission('view_wa_gateway')]} component={<WaChatTemplate />} />
      }
    />
    <Route
      path="chat/template/detail/:id"
      element={
        <Guard guards={[permission('view_wa_gateway')]} component={<WaChatTemplateDetail />} />
      }
    />
    <Route
      path="chatbot/:deviceId"
      element={
        <Guard guards={[permission('view_wa_gateway')]} component={<WAChatbot />} />
      }
    />
    <Route
      path="chatbot/:deviceId/admin-contacts"
      element={
        <Guard guards={[permission('view_wa_gateway')]} component={<WaChatbotAdmin />} />
      }
    />
  </Route>
);
