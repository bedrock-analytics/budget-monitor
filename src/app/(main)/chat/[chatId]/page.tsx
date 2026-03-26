import ChatSection from "../_components/chat-form";

type PageProps = {
  params: {
    chatId: string;
  };
};

export default async function Page(props: PageProps) {
  const params = await props.params; // 👈 important
  const { chatId } = params;

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <ChatSection chatId={chatId} />
    </div>
  );
}
