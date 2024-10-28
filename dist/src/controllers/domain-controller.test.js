import { describe, it, expect, vi } from 'vitest';
import { checkDomainConfigOnVercel } from './domain-controller.js';
describe('checkDomainConfigOnVercel', () => {
    it('should create an array from a response with A records', async () => {
        const domain = 'testdomain.com';
        const mockResponse = {
            ok: true,
            json: async () => ({
                configuredBy: null,
                nameservers: ['ns1.safesecureweb.com', 'ns2.safesecureweb.com', 'ns3.safesecureweb.com'],
                serviceType: 'external',
                cnames: [],
                aValues: ['3.18.255.247', '34.224.149.186'],
                conflicts: [],
                acceptedChallenges: [],
                misconfigured: true,
            }),
        };
        // Mock the fetch function to return the expected response
        global.fetch = vi.fn().mockResolvedValue(mockResponse);
        // Call the function being tested
        const result = await checkDomainConfigOnVercel(domain);
        // Check individual fields
        expect(result.misconfigured).toBe(true);
        expect(result.domain).toBe(domain);
        expect(result.dnsRecords).toHaveLength(2);
        // Check that the dnsRecords array contains both expected objects
        expect(result.dnsRecords).toEqual(expect.arrayContaining([
            expect.objectContaining({
                type: 'A',
                host: '@',
                value: '3.18.255.247',
                ttl: 3600,
            }),
            expect.objectContaining({
                type: 'A',
                host: '@',
                value: '34.224.149.186',
                ttl: 3600,
            }),
        ]));
    });
    it('the DNS section of the return should be empty when there are no aValues from the fetch', async () => {
        const domain = 'testdomain.com';
        const mockResponse = {
            ok: true,
            json: async () => ({
                configuredBy: null,
                nameservers: ['ns1.safesecureweb.com', 'ns2.safesecureweb.com', 'ns3.safesecureweb.com'],
                serviceType: 'external',
                cnames: [],
                aValues: [],
                conflicts: [],
                acceptedChallenges: [],
                misconfigured: true,
            }),
        };
        // Mock the fetch function to return the expected response
        global.fetch = vi.fn().mockResolvedValue(mockResponse);
        // Call the function being tested
        const result = await checkDomainConfigOnVercel(domain);
        // Check that the dnsRecords array contains both expected objects
        expect(result.dnsRecords).toHaveLength(0);
    });
    it('should throw an error if the fetch response is invalid or unsuccessful', async () => {
        const domain = 'testdomain.com';
        const mockErrorResponse = {
            ok: false,
            json: async () => ({
                message: 'Invalid domain configuration',
            }),
        };
        // Mock the fetch function to return the invalid response
        global.fetch = vi.fn().mockResolvedValue(mockErrorResponse);
        // Use the `.rejects` matcher to check for the thrown error
        await expect(checkDomainConfigOnVercel(domain)).rejects.toThrow('Error checking domain config');
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tYWluLWNvbnRyb2xsZXIudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb250cm9sbGVycy9kb21haW4tY29udHJvbGxlci50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQWMsTUFBTSxRQUFRLENBQUE7QUFDN0QsT0FBTyxFQUFFLHlCQUF5QixFQUFnQixNQUFNLHdCQUF3QixDQUFBO0FBRWhGLFFBQVEsQ0FBQywyQkFBMkIsRUFBRSxHQUFHLEVBQUU7SUFDdkMsRUFBRSxDQUFDLHVEQUF1RCxFQUFFLEtBQUssSUFBSSxFQUFFO1FBQ25FLE1BQU0sTUFBTSxHQUFHLGdCQUFnQixDQUFBO1FBQy9CLE1BQU0sWUFBWSxHQUFHO1lBQ2pCLEVBQUUsRUFBRSxJQUFJO1lBQ1IsSUFBSSxFQUFFLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQztnQkFDZixZQUFZLEVBQUUsSUFBSTtnQkFDbEIsV0FBVyxFQUFFLENBQUMsdUJBQXVCLEVBQUUsdUJBQXVCLEVBQUUsdUJBQXVCLENBQUM7Z0JBQ3hGLFdBQVcsRUFBRSxVQUFVO2dCQUN2QixNQUFNLEVBQUUsRUFBRTtnQkFDVixPQUFPLEVBQUUsQ0FBQyxjQUFjLEVBQUUsZ0JBQWdCLENBQUM7Z0JBQzNDLFNBQVMsRUFBRSxFQUFFO2dCQUNiLGtCQUFrQixFQUFFLEVBQUU7Z0JBQ3RCLGFBQWEsRUFBRSxJQUFJO2FBQ3RCLENBQUM7U0FDTCxDQUFBO1FBRUQsMERBQTBEO1FBQzFELE1BQU0sQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxDQUFBO1FBRXRELGlDQUFpQztRQUNqQyxNQUFNLE1BQU0sR0FBRyxNQUFNLHlCQUF5QixDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBRXRELDBCQUEwQjtRQUMxQixNQUFNLENB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