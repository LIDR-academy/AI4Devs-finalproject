import { SESClient } from "@aws-sdk/client-ses";
import { SesService } from "./ses.service";

jest.mock("@aws-sdk/client-ses", () => ({
  SESClient: jest.fn().mockImplementation(() => ({ send: jest.fn() })),
  SendEmailCommand: jest.fn().mockImplementation((input) => input),
}));

function getClientSendMock(svc: SesService): jest.Mock {
  const ClientClass = SESClient as jest.MockedClass<typeof SESClient>;
  const instance = ClientClass.mock.results[ClientClass.mock.results.length - 1].value as {
    send: jest.Mock;
  };
  return instance.send;
}

function makeService(): SesService {
  return new SesService();
}

describe("SesService — sendEmail", () => {
  it("calls SendEmailCommand with correct Source, Destination, and Message", async () => {
    const svc = makeService();
    const send = getClientSendMock(svc);
    send.mockResolvedValue({});

    await svc.sendEmail({
      to: "user@example.com",
      subject: "Items expiring soon",
      htmlBody: "<p>Yogurt expires tomorrow</p>",
    });

    expect(send).toHaveBeenCalledTimes(1);
    const command = send.mock.calls[0][0] as {
      Destination: { ToAddresses: string[] };
      Message: { Subject: { Data: string }; Body: { Html: { Data: string } } };
    };
    expect(command.Destination.ToAddresses).toContain("user@example.com");
    expect(command.Message.Subject.Data).toBe("Items expiring soon");
    expect(command.Message.Body.Html.Data).toBe("<p>Yogurt expires tomorrow</p>");
  });

  it("uses AWS_SES_FROM_ADDRESS env var as the Source address", async () => {
    process.env.AWS_SES_FROM_ADDRESS = "noreply@realsavefooding.com";
    const svc = makeService();
    const send = getClientSendMock(svc);
    send.mockResolvedValue({});

    await svc.sendEmail({ to: "u@x.com", subject: "S", htmlBody: "<p>B</p>" });

    const command = send.mock.calls[0][0] as { Source: string };
    expect(command.Source).toBe("noreply@realsavefooding.com");
    delete process.env.AWS_SES_FROM_ADDRESS;
  });

  it("throws after logging when SES send rejects", async () => {
    const svc = makeService();
    const send = getClientSendMock(svc);
    send.mockRejectedValue(new Error("SES quota exceeded"));

    await expect(
      svc.sendEmail({ to: "u@x.com", subject: "S", htmlBody: "<p>B</p>" }),
    ).rejects.toThrow("SES quota exceeded");
  });
});
